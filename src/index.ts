import { Instagram } from "./helpers/Instagram"
import { schedule } from "node-cron"
import dotenv from "dotenv"
dotenv.config()
;(async () => {
  if (!process.env.USERNAME || !process.env.PASSWORD)
    throw new Error("Specify USERNAME and PASSWORD in env variables")

  const user = new Instagram(process.env.USERNAME, process.env.PASSWORD)
  await user.login()

  process.on("SIGINT", async function () {
    console.log("Caught interrupt signal, logging out ...")
    await user.logout()
    process.exit()
  })

  schedule("0 12 * * * *", async () => {
    await user.likeTimeline()
  })
})()
