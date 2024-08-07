import Kasumi, {
    BaseCommand,
    CommandFunction,
    BaseSession,
    Card,
} from "kasumi.js";
import Apex, { humanToTrackerGG } from "../lib/apex";
import { generateImage } from "../lib/drawer";
import sharp from "sharp";

export class ApexSearchCommand extends BaseCommand {
    name = "search";
    description = "搜索用户";

    private apexClient!: Apex;

    init(client: Kasumi<any>, loggerSequence: string[]): void {
        super.init(client, loggerSequence);
        this.apexClient = new Apex(
            this.client,
            this.client.config.getSync("apex::auth.ALSKey")
        );
    }

    private romanize(num: number) {
        if (isNaN(num)) return "";
        var digits = String(+num).split(""),
            key = [
                "",
                "C",
                "CC",
                "CCC",
                "CD",
                "D",
                "DC",
                "DCC",
                "DCCC",
                "CM",
                "",
                "X",
                "XX",
                "XXX",
                "XL",
                "L",
                "LX",
                "LXX",
                "LXXX",
                "XC",
                "",
                "I",
                "II",
                "III",
                "IV",
                "V",
                "VI",
                "VII",
                "VIII",
                "IX",
            ],
            roman = "",
            i = 3;
        while (i--)
            // @ts-ignore
            roman = (key[+digits.pop() + i * 10] || "") + roman;
        return Array(+digits.join("") + 1).join("M") + roman;
    }
    func: CommandFunction<BaseSession, any> = async (session) => {
        let ts = Date.now();
        let last_ts = ts;
        this.logger.info(`Start generation: ${ts}`);
        let username = session.args[0];
        let plat = session.args[1] || "";
        let platform: "PC" | "PS4" | "X1" = "PC";
        if (!username) {
            let connection = await this.apexClient.getConnection(
                platform,
                session.authorId
            );
            if (connection) {
                username = connection.username;
            } else return session.reply("您还未绑定！请先绑定或输入用户名");
        }
        if (humanToTrackerGG[plat.toLowerCase()]) {
            platform = humanToTrackerGG[plat.toLowerCase()];
        }
        const { err, data } = await session.send(
            new Card().addText("正在加载……请稍候")
        );
        if (err) return this.logger.error(err);
        let messageId = data.msg_id;
        this.logger.info(
            `Sent initial message, processing time ${Date.now() - last_ts}ms`
        );
        last_ts = Date.now();
        const user = await this.apexClient
            .getPlayerDetail(platform, username)
            .catch(() => undefined);
        if (this.apexClient.isError(user)) {
            return session.update(
                messageId,
                new Card().addText(
                    `获取名为 ${username} 的 ${platform} 用户的资料失败\n(font)${user.Error}(font)[danger]`
                )
            );
        }
        if (!user || !user.legends || !user.global) {
            this.logger.error(user);
            return session.update(
                messageId,
                new Card().addText(
                    `获取名为 ${username} 的 ${platform} 用户的资料失败\n(font)其他错误(font)[danger]`
                )
            );
        }
        // console.dir(user, { depth: 1 });
        this.logger.info(
            `Got player stat, processing time ${Date.now() - last_ts}ms`
        );
        await session.update(
            messageId,
            new Card().addText(
                `已获取用户资料，耗时 (font)${(Date.now() - last_ts) / 1000}s(font)[${Date.now() - last_ts > 1500 ? (Date.now() - ts > 3000 ? "danger" : "warning") : "success"}]`
            )
        );
        last_ts = Date.now();
        this.logger.debug("Generation: Recieved data from remote API");
        let br_predator =
            await this.apexClient.getPredatorRequirement(platform);
        let formater = Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 2,
        });

        let stat = user.global;
        let legend = user.legends.selected;
        let detail_header_1,
            detail_number_1,
            detail_header_2,
            detail_number_2,
            detail_header_3,
            detail_number_3;
        // detail_header_1 = detail_number_1 = detail_header_2 = detail_number_2 = detail_header_3 = detail_number_3 = '';

        detail_header_1 = legend.data[0]?.name || "";
        detail_number_1 = legend.data[0]
            ? formater.format(legend.data[0].value)
            : "";
        detail_header_2 = legend.data[1]?.name || "";
        detail_number_2 = legend.data[1]
            ? formater.format(legend.data[1].value)
            : "";
        detail_header_3 = legend.data[2]?.name || "";
        detail_number_3 = legend.data[2]
            ? formater.format(legend.data[2].value)
            : "";
        let stat_header_1,
            stat_number_1,
            stat_header_2,
            stat_number_2,
            stat_header_3,
            stat_number_3,
            stat_header_4,
            stat_number_4;
        //stat_header_1 = stat_number_1 = stat_header_2 = stat_number_2 = stat_header_3 = stat_number_3 = stat_header_4 = stat_number_4 = '';

        stat_header_1 = "Level";
        stat_number_1 =
            stat.levelPrestige > 0
                ? `${this.romanize(stat.levelPrestige)}.${formater.format(stat.level)}`
                : formater.format(stat.level);
        stat_header_2 = "BP Level";
        stat_number_2 =
            stat.battlepass.level > 0
                ? formater.format(stat.battlepass.level)
                : "Unk";
        stat_header_3 = "Active Ban";
        stat_number_3 = stat.bans.isActive
            ? `${formater.format(stat.bans.remainingSeconds)}s`
            : "None";
        stat_header_4 = "Platform";
        stat_number_4 = stat.platform;
        this.logger.debug("Generation: Start generation");
        let buffer = await generateImage({
            username: user.global.name,
            user_avatar_url:
                user.global.avatar ||
                "https://img.kookapp.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg",

            stat_header_1,
            stat_number_1,
            stat_header_2,
            stat_number_2,
            stat_header_3,
            stat_number_3,
            stat_header_4,
            stat_number_4,

            br_current_rank_number: stat.rank.rankScore,
            br_point_until_next_rank: br_predator.val - stat.rank.rankScore,
            br_next_rank_number: br_predator.val,
            br_current_rank_image: stat.rank.rankImg || Apex.defaultRankImage,
            br_next_rank_image: Apex.predatorRankImage,

            ar_current_rank_image: stat.arena.rankImg || Apex.defaultRankImage,
            ar_next_rank_image: Apex.predatorRankImage,

            detail_legend_name: legend.LegendName,
            detail_legend_image: `https://trackercdn.com/cdn/apex.tracker.gg/legends/${legend.LegendName.toLowerCase()}-tall.png`, // need fix
            detail_header_1,
            detail_number_1,
            detail_header_2,
            detail_number_2,
            detail_header_3,
            detail_number_3,
        });

        this.logger.info(
            `Generated image, processing time ${Date.now() - last_ts}ms`
        );
        await session.update(
            messageId,
            new Card().addText(
                `已生成图像，耗时 (font)${(Date.now() - last_ts) / 1000}s(font)[${Date.now() - last_ts > 6000 ? (Date.now() - ts > 3000 ? "danger" : "warning") : "success"}]`
            )
        );
        last_ts = Date.now();
        this.logger.debug("Generation: Start uploading");
        buffer = await sharp(buffer).resize(2000).jpeg().toBuffer();
        {
            const { err, data } = await this.client.API.asset.create(buffer, {
                filename: "image.jpg",
            });
            if (err) return this.logger.error(err);
            let url = data.url;
            if (!url) throw new Error("Cannot upload image");
            this.logger.info(
                `Uploaded image, processing time ${Date.now() - last_ts}ms`
            );
            await session.update(
                messageId,
                new Card().addText(
                    `已上传图像，耗时 (font)${(Date.now() - last_ts) / 1000}s(font)[${Date.now() - last_ts > 1500 ? (Date.now() - ts > 3000 ? "danger" : "warning") : "success"}]`
                )
            );
            last_ts = Date.now();
            this.logger.debug("Generation: Present image to user");
            await session.update(
                messageId,
                new Card()
                    .addText(
                        `查询成功，本次用时：(font)${(Date.now() - ts) / 1000}s(font)[${Date.now() - ts > 6657 ? (Date.now() - ts > 8964 ? "danger" : "warning") : "success"}]`
                    )
                    .addImage(url)
            );
        }
        this.logger.info(
            `Sent message, processing time ${Date.now() - last_ts}ms`
        );
        last_ts = Date.now();
        this.logger.info(`End: ${Date.now()}`);
        this.logger.info(`Generation time: ${Date.now() - ts}ms`);
    };
}

const apexSearchCommand = new ApexSearchCommand();
export default apexSearchCommand;
