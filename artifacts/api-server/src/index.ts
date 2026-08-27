import app from "./app";
import { logger } from "./lib/logger";

// api-server слушает отдельный порт 5000 (чтобы не конфликтовать с веб-интерфейсом на 8080)
const port = Number(process.env["PORT_API"]) || 5000;

app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, `Server listening on 0.0.0.0:${port}`);
});
