import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Setup Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client can join a room using their teamId to receive private team events (like match found)
    socket.on("joinTeamRoom", (teamId) => {
      socket.join(`team_${teamId}`);
      console.log(`Socket ${socket.id} joined room team_${teamId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Set up Matchmaking background task
  const MATCHMAKING_INTERVAL_MS = 5000; // Run every 5 seconds
  const BASE_THRESHOLD = 2;

  setInterval(async () => {
    try {
      // Fetch all entries in the queue
      const queueEntries = await prisma.queueEntry.findMany({
        orderBy: { queuedAt: "asc" }, // Older entries priority
        include: { team: true },
      });

      // Group by server (allow comma-separated servers)
      const queuesByServer = {};
      for (const entry of queueEntries) {
        const servers = entry.server.split(",").map((s) => s.trim());
        for (const currentServer of servers) {
          if (!queuesByServer[currentServer]) {
            queuesByServer[currentServer] = [];
          }
          queuesByServer[currentServer].push(entry);
        }
      }

      const globalMatchedIds = new Set();

      for (const [server, entries] of Object.entries(queuesByServer)) {
        if (entries.length < 2) continue;

        const localMatchedIds = new Set();

        for (let i = 0; i < entries.length; i++) {
          const entryA = entries[i];
          if (globalMatchedIds.has(entryA.id) || localMatchedIds.has(entryA.id)) continue;

          const waitTimeSecs = (Date.now() - entryA.queuedAt.getTime()) / 1000;
          const threshold = BASE_THRESHOLD + Math.floor(waitTimeSecs / 30);

          for (let j = i + 1; j < entries.length; j++) {
            const entryB = entries[j];
            if (globalMatchedIds.has(entryB.id) || localMatchedIds.has(entryB.id)) continue;

            const rankDiff = Math.abs(entryA.avgRankScore - entryB.avgRankScore);

            if (rankDiff <= threshold) {
              globalMatchedIds.add(entryA.id);
              globalMatchedIds.add(entryB.id);
              localMatchedIds.add(entryA.id);
              localMatchedIds.add(entryB.id);

              const match = await prisma.match.create({
                data: {
                  team1Id: entryA.teamId,
                  team2Id: entryB.teamId,
                  server: server,
                  rankDifference: rankDiff,
                  status: "pending",
                },
              });

              await prisma.queueEntry.deleteMany({
                where: { id: { in: [entryA.id, entryB.id] } },
              });

              await prisma.team.updateMany({
                where: { id: { in: [entryA.teamId, entryB.teamId] } },
                data: { isQueued: false },
              });

              console.log(
                `Match created between Team ${entryA.teamId} and Team ${entryB.teamId} on ${server}`,
              );

              io.to(`team_${entryA.teamId}`).emit("matchFound", {
                matchId: match.id,
                opponentId: entryB.teamId,
              });
              io.to(`team_${entryB.teamId}`).emit("matchFound", {
                matchId: match.id,
                opponentId: entryA.teamId,
              });
              break;
            }
          }
        }
      }
    } catch (e) {
      console.error("Matchmaking error:", e);
    }
  }, MATCHMAKING_INTERVAL_MS);

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
