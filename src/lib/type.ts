export namespace Segement {
    export type IStat = {
        rank: null | number;
        percentile: number;
        displayName: string;
        displayCategory: string;
        category: any;
        description: any;
        metadata: {
            iconUrl?: string;
            rankName?: string;
            sectionLabel?: string;
        };
        value: number;
        displayValue: string;
        displayType: string;
    };
    export type IOverview = {
        type: "overview";
        attributes: {};
        metadata: {
            name: string;
        };
        expiryDate: string;
        stats: {
            level: IStat;
            kills: IStat;
            damage: IStat;
            headshots: IStat;
            winsWithFullSquad: IStat;
            rankScore: IStat;
            arenaRankScore: IStat;
            season6Wins?: IStat;
            season7Wins?: IStat;
            season7Kills?: IStat;
            season8Kills?: IStat;
            season9Kills?: IStat;
            season11Wins?: IStat;
            season11Kills?: IStat;
            season12Wins?: IStat;
            wins?: IStat;
            peakRankScore: IStat;
            [name: string]: IStat | undefined;
        };
    };
    export type ILegend = {
        type: "legend";
        attributes: {
            id: string;
        };
        metadata: {
            name: string;
            imageUrl: string;
            tallImageUrl: string;
            bgImageUrl: string;
            protraitImageUrl: string;
            legendColor: string;
            isActive: boolean;
        };
        stats: {
            [name: string]: IStat;
        };
    };
}

export interface IError {
    Error: string;
}

export interface IUserDetail {
    global: {
        name: string;
        uid: number;
        avatar: string;
        platform: string;
        level: number;
        toNextLevelPercent: number;
        internalUpdateCount: number;
        bans: {
            isActive: boolean;
            remainingSeconds: number;
            last_banReason: string;
        };
        rank: {
            rankScore: number;
            rankName: string;
            ranDiv: number;
            ladderPosPlatform: number;
            rankImg: string;
            rankedSeason: string;
        };
        arena: {
            rankScore: number;
            rankName: string;
            rankDiv: number;
            ladderPosPlatform: number;
            rankImg: string;
            rankedSeason: string;
        };
        battlepass: {
            level: number;
            history: {
                [key: string]: number;
            };
        };
        internalParsingVersion: number;
        badges: {
            name: string;
            value: number;
        }[];
        levelPrestige: number;
    };
    realtime: {
        lobbyState: string;
        isOnline: 0 | 1;
        isInGame: 0 | 1;
        canJoin: 0 | 1;
        partyFull: 0 | 1;
        selectedLegend: string;
        currentState: string;
        currentStateSinceTimestamp: number;
        currentStateAsText: string;
    };
    legends: {
        selected: {
            LegendName: string;
            data: {
                name: string;
                value: number;
                key: string;
                global: boolean;
            }[];
            gameInfo: {
                skin: string;
                skinRariry: string;
                frame: string;
                frameRarity: string;
                pose: string;
                poseRarity: string;
                intro: string;
                introRarity: string;
                badge: {
                    name: string;
                    value: number;
                    category: string;
                }[];
            };
        };
        ImgAssets: {
            icon: string;
            banner: string;
        };
    };
    all: {
        [key: string]: any;
    };
}

export namespace Predator {
    export type IRequirement = {
        foundRank: number;
        val: number;
        uid: string;
        updateTimestamp: number;
        totalMastersAndPreds: number;
    };
    export type IPlatform = {
        PC: IRequirement;
        PS4: IRequirement;
        X1: IRequirement;
        SWITCH: IRequirement;
    };
    export type IGameType = {
        RP: IPlatform;
        AP: IPlatform;
    };
}
