import { Instagram } from "./helpers/Instagram"

import dotenv from "dotenv"
dotenv.config()

const sleep = (millis: number) => new Promise((res) => setTimeout(res, millis))

async function likeTimeline(user: Instagram) {
  const timeline = await user.getTimeline()
  user.log(`Starting timeline like for ${timeline.length} pictures`)
  for (const post of timeline) {
    await user.likePicture(post.id)
    await sleep(5000)
  }
}

async function main() {
  let user
  try {
    if (!process.env.USERNAME || !process.env.PASSWORD)
      throw new Error("Specify USERNAME and PASSWORD in env variables")

    user = new Instagram(process.env.USERNAME, process.env.PASSWORD)
    await user.login()
    await likeTimeline(user)
  } catch (err) {
    console.error("Process failed", err)
  } finally {
    user &&
      (await user.ig.account
        .logout()
        .catch((err) => console.error("failed to logout user")))
  }
}

main().catch((err) => console.log("ERROR", err))
