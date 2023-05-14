const { Leetcode } = require("../../../utils/scraper");

export default async function handler(req, res) {
  const { slug } = req.query;
  const [site, userName] = slug;

  if (site === "leetcode") {
    try {
      const leetcode = new Leetcode();
      const data = await leetcode.getStats(userName);
      console.log("data is", data);
      return res.status(200).send(data);
    } catch (error) {
      return res.status(404).send("Leetcode profile not found.");
    }
  } else if (site === "gfg") {
    console.log("It is gfg");
  } else if (site === "github") {
    console.log("It is github");
  } else {
    return res.status(404).send("invalid url");
  }

  res.status(200).send(slug);
}
