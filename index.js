const Twit = require("twit")

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

const HOURS_INTERVAL = 6

const tweetNo = async () => {
  try {
    const data = await T.post("statuses/update", { status: "Not yet" })
    console.log(data)
  } catch (err) {
    console.error(err.stack)
  }
}

setInterval(tweetNo, HOURS_INTERVAL * 60 * 1000 * 60)

tweetNo()
