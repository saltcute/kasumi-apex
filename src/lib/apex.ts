import axios, { AxiosInstance } from "axios";
import upath from "upath";
import mcache from "memory-cache";
import * as fs from "fs";
import { IError, IUserDetail, Predator } from "./type";
import Kasumi from "kasumi.js";
import { CustomStorage } from "@/config/type";

export let humanToTrackerGG: {
    [key: string]: "PC" | "PS4" | "X1";
} = {
    origin: "PC",
    psn: "PS4",
    ps: "PS4",
    xbox: "X1",
    xbl: "X1",
    playstation: "PS4",
    pc: "PC",
};

export default class Apex {
    private client: Kasumi<CustomStorage>;
    private als_token: string;
    private _requestor_als: AxiosInstance;
    public static defaultRankImage =
        "https://trackercdn.com/cdn/apex.tracker.gg/ranks/bronze4.png";
    public static predatorRankImage =
        "https://trackercdn.com/cdn/apex.tracker.gg/ranks/apex.png";
    constructor(client: Kasumi<any>, als_token: string) {
        this.als_token = als_token;
        this._requestor_als = axios.create({
            baseURL: "https://api.mozambiquehe.re/",
            params: {
                auth: this.als_token,
            },
        });

        this.client = client;
    }

    _readJSON(path: string): any | undefined {
        try {
            return JSON.parse(
                fs.readFileSync(path, { encoding: "utf-8", flag: "r" })
            );
        } catch (e) {
            return undefined;
        }
    }
    _writeJSON(path: string, data: any): void {
        let dir = upath.dirname(path);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path, JSON.stringify(data));
    }
    getCache(keyp: string[]): Promise<any | undefined> {
        let key = keyp.join("");
        let cache = mcache.get(key);
        return cache;
    }
    putCache(keyp: string[], data: any) {
        let key = keyp.join("");
        mcache.put(key, data, 30 * 60 * 1000);
        return data;
    }
    private async requestor_als(endpoint: string, params?: any) {
        return this._requestor_als({
            url: endpoint,
            params,
        })
            .then((res) => {
                return res.data;
            })
            .catch((e) => {
                /*console.log(e);*/ throw e;
            });
    }
    private async cache(keyp: string[], func: () => Promise<any>) {
        let cache = this.getCache(keyp);
        if (cache) return cache;
        else {
            let data = await func();
            this.putCache(keyp, data);
            return data;
        }
    }
    public async getConnection(
        platform: "PC" | "PS4" | "X1",
        kookUserId: string
    ) {
        let connection = await this.client.config.getOne(
            `apex::config.connection.${kookUserId}`
        );
        if (connection) return connection[platform];
        else return undefined;
    }
    public async connectPlatform(
        platform: "PC" | "PS4" | "X1",
        username: string,
        kookUserId: string
    ) {
        let connection =
            (await this.client.config.getOne(
                `apex::config.connection.${kookUserId}`
            )) || {};
        connection[platform] = {
            username,
            timestamp: Date.now(),
        };
        this.client.config.set(
            `apex::config.connection.${kookUserId}`,
            connection
        );
    }
    public async disconnectPlatform(
        platform: "PC" | "PS4" | "X1",
        kookUserId: string
    ) {
        let connection = await this.client.config.getOne(
            `apex::config.connection.${kookUserId}`
        );
        if (connection) connection[platform] = undefined;
    }
    /*
    public async getPlayerDetail(platform: 'PC' | 'PS4' | 'X1', username: string): Promise<userDetail> {
        return this.cache(['player_detail', platform, username], async () => {
            return this.requestor_gg(upath.join('v2', 'apex', 'standard', 'profile', platform, username))
                .then((res) => { return res.data; })
                .catch((e) => { console.log(e); throw e });
        })
    }*/
    isError(payload: any): payload is IError {
        return typeof payload.Error == "string";
    }

    public async getPlayerDetail(
        platform: "PC" | "PS4" | "X1",
        username: string
    ): Promise<IUserDetail | IError> {
        return this.cache(["player_detail", platform, username], async () => {
            return this.requestor_als(upath.join("bridge"), {
                auth: await this.client.config.getOne("apex::alsKey"),
                player: username,
                platform,
            })
                .then((res) => {
                    return res;
                })
                .catch((e) => {
                    throw e;
                });
        }).catch((e) => {
            throw e;
        });
    }
    public async getPredatorRequirement(
        platform: "PC" | "PS4" | "X1"
    ): Promise<Predator.IRequirement> {
        return this.cache(
            ["predator_requirement", "RP", platform],
            async () => {
                return this.requestor_als("predator", {
                    auth: await this.client.config.getOne("apex::auth.ALSKey"),
                })
                    .then((res: Predator.IGameType) => {
                        return res["RP"][platform];
                    })
                    .catch((e) => {
                        throw e;
                    });
            }
        );
    }
}
