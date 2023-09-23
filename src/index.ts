import { IgApiClient, UserFeedResponseItemsItem } from "instagram-private-api"
import { Instagram } from "./helpers/Instagram"

import dotenv from "dotenv"
dotenv.config()

async function main() {
  try {
    if (!process.env.USERNAME || !process.env.PASSWORD)
      throw new Error("Specify USERNAME and PASSWORD in env variables")

    const user = new Instagram(process.env.USERNAME, process.env.PASSWORD)
    await user.login()
    const feed: UserFeedResponseItemsItem[] = (await user.getFeed().next())
      .value
    for (const post of feed) {
      await user.likePictures(post.id)
    }
  } catch (err) {
    console.error(err)
  }
}

main()
