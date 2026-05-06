import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";

const app = Fastify();

// Initialize Prisma Client with adapter
const prisma = new PrismaClient();

app.get("/", async () => {
  return { message: "API running 🚀" };
});

app.get("/test-db", async () => {
  const data = await prisma.test.create({
    data: { name: "working ✅" },
  });

  return data;
});

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
