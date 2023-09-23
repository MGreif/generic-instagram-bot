import {
  AccountRepositoryLoginResponseLogged_in_user,
  IgApiClient,
  TagFeed,
  TagFeedResponseItemsItem,
  TimelineFeed,
  TimelineFeedResponseMedia_or_ad,
  UserFeedResponseItemsItem,
} from "instagram-private-api"
import { getRandomArrayEntry, sleep } from "./utils"

export class Instagram {
  public ig = new IgApiClient()
  public username: string
  public password: string

  loggedInUser: AccountRepositoryLoginResponseLogged_in_user | null = null
  public isLoggedIn = !!this.loggedInUser

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }

  public log(...args: any[]) {
    console.log(`[${this.username}][debug] -`, ...args)
  }

  public error(...args: any[]) {
    console.log(`[${this.username}][error] -`, ...args)
  }

  public async login() {
    this.ig.state.generateDevice(this.username)
    const loggedInUser = await this.ig.account
      .login(this.username, this.password)
      .then((res) => {
        this.log("logged in")
        return res
      })
      .catch((err) => this.error(err))
    this.loggedInUser = loggedInUser || null
  }

  public async logout() {
    await this.ig.account
      .logout()
      .catch((err) => this.error("failed to logout"))
  }

  public async *getFeed(): AsyncGenerator<UserFeedResponseItemsItem[]> {
    if (!this.loggedInUser) throw new Error("user needs to be logged in")
    const userFeed = this.ig.feed.user(this.loggedInUser.pk)
    yield await userFeed.items()
  }

  public async getPostsByHashtag(
    hashtag: string,
  ): Promise<TagFeedResponseItemsItem[]> {
    if (!this.loggedInUser) throw new Error("user needs to be logged in")
    const results: TagFeed = await this.ig.feed.tag(hashtag)
    return results.items()
  }

  public async getTimeline(): Promise<TimelineFeedResponseMedia_or_ad[]> {
    if (!this.loggedInUser) throw new Error("user needs to be logged in")
    const results: TimelineFeed = await this.ig.feed.timeline()
    return results.items()
  }

  public async likeTimeline() {
    if (!this.loggedInUser) throw new Error("user needs to be logged in")
    const timeline = await this.getTimeline()
    this.log(`Starting timeline like for ${timeline.length} pictures`)
    for (const post of timeline) {
      if (post.has_liked) {
        this.log("already liked picture", post.id)
        continue
      }
      await this.likePicture(post.id)
      await sleep(5000)
    }
  }

  public async likeAndCommentTimeline(
    commentList: string[],
    commentProbabilityPercentage = 100,
  ) {
    if (!this.loggedInUser) throw new Error("user needs to be logged in")
    const timeline = await this.getTimeline()
    this.log(`Starting timeline like for ${timeline.length} pictures`)
    for (const post of timeline) {
      if (post.has_liked) {
        this.log("already liked picture", post.id)
        continue
      }
      await this.likePicture(post.id)
      const probability = Math.floor(Math.random() * 100)
      if (probability < commentProbabilityPercentage) {
        await this.commentOnPicture(post.id, getRandomArrayEntry(commentList))
      }
      await sleep(5000)
    }
  }

  public async commentOnPicture(id: string, comment: string) {
    if (!this.loggedInUser) throw new Error("user needs to be logged in")
    await this.ig.media.comment({
      mediaId: id,
      text: comment,
      module: "mod",
    })
  }

  public async likePicture(id: string) {
    if (!this.loggedInUser) throw new Error("user needs to be logged in")
    await this.ig.media
      .like({
        mediaId: id,
        moduleInfo: {
          module_name: "profile",
          user_id: this.loggedInUser.pk,
          username: this.loggedInUser.username,
        },
        d: 1,
      })
      .then(() => this.log("liking media:", id))
      .catch((err) => this.error("[error] failed to like media: ", err))
  }
}
