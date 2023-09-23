import {
  AccountRepositoryLoginResponseLogged_in_user,
  IgApiClient,
  UserFeedResponseItemsItem,
} from "instagram-private-api"

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

  public async login() {
    this.ig.state.generateDevice(this.username)
    await this.ig.simulate.preLoginFlow()
    const loggedInUser = await this.ig.account.login(
      this.username,
      this.password,
    )
    process.nextTick(async () => await this.ig.simulate.postLoginFlow())
    this.loggedInUser = loggedInUser
  }

  public async *getFeed(): AsyncGenerator<UserFeedResponseItemsItem[]> {
    if (!this.loggedInUser) throw new Error("user needs to be logged in")
    const userFeed = this.ig.feed.user(this.loggedInUser.pk)
    yield await userFeed.items()
  }

  public async likePictures(id: string) {
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
      .then(
        (res) => console.log("successfully liked media:", id),
        (err) => console.error("[error] failed to like media: ", err),
      )
  }
}
