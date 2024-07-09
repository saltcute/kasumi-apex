import axios, { AxiosInstance } from "axios";
import mcache from "memory-cache";
import { IError, IUserDetail, Predator } from "./type";
import Kasumi from "kasumi.js";
import { CustomStorage } from "@/config/type";

export let humanToTrackerGG: {
    [key: string]: "PC" | "PS4" | "X1";
} = {
    origin: "PC",
    ea: "PC",
    pc: "PC",
    ps: "PS4",
    ps1: "PS4",
    ps2: "PS4",
    ps3: "PS4",
    ps4: "PS4",
    ps5: "PS4",
    psp: "PS4",
    psv: "PS4",
    psn: "PS4",
    playstation: "PS4",
    x1: "X1",
    x1x: "X1",
    x1s: "X1",
    xss: "X1",
    xsx: "X1",
    xbox: "X1",
    xbox1: "X1",
    xboxone: "X1",
    xbox360: "X1",
    xboxseriess: "X1",
    xboxseriesx: "X1",
    xboxlive: "X1",
    xbl: "X1",
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
        return payload && typeof payload.Error == "string";
    }

    public async getPlayerDetail(
        platform: "PC" | "PS4" | "X1",
        username: string
    ): Promise<IUserDetail | IError> {
        return this.cache(["player_detail", platform, username], async () => {
            return this.requestor_als("bridge", {
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
                return this.requestor_als("predator")
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
