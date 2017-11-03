const Twit = require("twit")
const puppeteer = require("puppeteer")
const path = require("path")

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

const TEMBELO_URL = "http://www.anr.org.py/paginas.php?cod=29"
const TWEET_TEXT =
  "Stroessner sigue apareciendo como Líder Histórico de la ANR."
const DESAPARECIDOS_TWEET_TEXT = "No mencionan asesinados ni torturados."
const HOURS_INTERVAL = 6

const findStroessner = async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(TEMBELO_URL)
    // Vemos si en el título se menciona a Stroessner
    const titleSelector = await page.$("span.txtAutoridades")
    let titleHtml = await page.evaluate(body => body.innerHTML, titleSelector)
    await titleSelector.dispose()

    const textSelector = await page.$("div.textos_central")
    let textHtml = await page.evaluate(body => body.innerHTML, textSelector)
    await textSelector.dispose()

    if (titleHtml.toLowerCase().search("stroessner") !== -1) {
      // Stroessner sigue en la página
      const tembeloPath = path.join(__dirname, "./tembelo.png")
      await page.screenshot({ path: tembeloPath })
      T.postMediaChunked({ file_path: tembeloPath }, (err, mediaData) => {
        if (err) {
          console.error("Error al intentar enviar screenshot: ", err)
          return
        }
        const { media_id_string } = mediaData
        let tweetFinalText = TWEET_TEXT
        // 'desaparecid' y 'asesinad' abarca desaparecidas/os y asesinadas/os
        if (
          textHtml.toLowerCase().search("desaparecid") === -1 &&
          textHtml.toLowerCase().search("asesinad") === -1
        ) {
          tweetFinalText += ` ${DESAPARECIDOS_TWEET_TEXT}`
        }
        tweetFinalText += ` ${TEMBELO_URL}`
        const tweet = { status: tweetFinalText, media_ids: [media_id_string] }
        T.post("statuses/update", tweet, (err, data) => {
          if (err) {
            console.error("Error al enviar tweet: ", err)
            return
          }
        })
      })
    }
    await browser.close()
  } catch (err) {
    console.error(`Error: ${err.stack}`)
  }
}

findStroessner()
//  setInterval(findStroessner, 30000)
// setInterval(tweetNo, HOURS_INTERVAL * 60 * 1000 * 60)
