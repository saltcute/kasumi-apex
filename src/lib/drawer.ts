import fs from "fs";
import upath from "upath";
import puppeteer, { Browser, Page } from "puppeteer";

let browser: Browser | Promise<Browser>, page: Page | Promise<Page>;
(async () => {
    browser = await puppeteer.launch({
        defaultViewport: {
            width: 4000,
            height: 3000,
            deviceScaleFactor: 1,
        },
        headless: true,
    });
    page = await browser.newPage();
})();
const josefinSans = fs.readFileSync(
    upath.join(
        __dirname,
        "..",
        "..",
        "assets",
        "font",
        "josefin_sans",
        "josefin_sans_regular.ttf"
    ),
    {
        encoding: "base64",
    }
);
const secularOne = fs.readFileSync(
    upath.join(
        __dirname,
        "..",
        "..",
        "assets",
        "font",
        "secular_one",
        "secular_one_regular.ttf"
    ),
    {
        encoding: "base64",
    }
);

function getFonts() {
    return `
@font-face {
    font-family: 'Josefin Sans';
    src: url(data:font/truetype;charset=utf-8;base64,${josefinSans}) format('truetype');
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: 'Secular One';
    src: url(data:font/truetype;charset=utf-8;base64,${secularOne}) format('truetype');
    font-weight: normal;
    font-style: normal;
}
`;
}

export async function generateImage({
    username,
    user_avatar_url,

    stat_header_1,
    stat_number_1,
    stat_header_2,
    stat_number_2,
    stat_header_3,
    stat_number_3,
    stat_header_4,
    stat_number_4,

    br_current_rank_number,
    br_point_until_next_rank,
    br_next_rank_number,
    br_current_rank_image,
    br_next_rank_image,

    ar_current_rank_image,
    ar_next_rank_image,

    detail_legend_name,
    detail_legend_image,
    detail_header_1,
    detail_number_1,
    detail_header_2,
    detail_number_2,
    detail_header_3,
    detail_number_3,
}: {
    username: string;
    user_avatar_url: string;

    stat_header_1: string;
    stat_number_1: string;
    stat_header_2: string;
    stat_number_2: string;
    stat_header_3: string;
    stat_number_3: string;
    stat_header_4: string;
    stat_number_4: string;

    br_current_rank_number: number;
    br_point_until_next_rank: number;
    br_next_rank_number: number;
    br_current_rank_image: string;
    br_next_rank_image: string;

    ar_current_rank_image: string;
    ar_next_rank_image: string;

    detail_legend_name: string;
    detail_legend_image: string;
    detail_header_1: string;
    detail_number_1: string;
    detail_header_2: string;
    detail_number_2: string;
    detail_header_3: string;
    detail_number_3: string;
}) {
    page = await page;
    let appliedTemplate: string = "";
    let br_until = br_point_until_next_rank < 0 ? "over" : "until";
    br_point_until_next_rank = Math.abs(br_point_until_next_rank);
    let rawTemplate = fs.readFileSync(
        upath.join(__dirname, "..", "..", "assets", "template.htm"),
        { encoding: "utf-8", flag: "r" }
    );
    rawTemplate = rawTemplate.replace("<style>", `<style>\n${getFonts()}`);
    eval(`appliedTemplate = \`${rawTemplate.split("</script>")[1]}\`;`);
    appliedTemplate =
        rawTemplate.split("</script>")[0] + "</script>" + appliedTemplate;
    fs.mkdirSync(upath.join(__dirname, "data"), { recursive: true });
    fs.writeFileSync(
        upath.join(__dirname, "..", "..", "assets", "latest.htm"),
        appliedTemplate
    );
    await page.setContent(appliedTemplate);
    return await page.screenshot();
}
