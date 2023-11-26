import path from "path";

interface Options {
    path: string;
    languages: string[];
    default: string;
    fallback: string;
    onMissingKey?: (key: string) => string | undefined;
    onMissingLanguage?: (language: string) => string | undefined;
    autoUpdate?: boolean;

}

interface Languages {
    [key: string]: {
        [key: string]: string | Promise<string>;
    };
}
interface Translator {
    __: (key: string) => string ;
}
 

let languages: Languages = {};
let config: Options;

const i18n = {
    async configuration(options: Options) {
        config = options;

        for (const language of config.languages) {
            const json = await import(path.join(config.path, `${language}.json`));
            languages[language] = json;
        }
    },
    get() {
        return {
            getTranslator: (language: string) => {
                const getkey = (key: string) => {
                    if (!languages[language]) {
                         
                        if (config.fallback) {
                            return languages[config.fallback][key];
                        } else {
                            if (config.onMissingLanguage) {
                                return config.onMissingLanguage(language);
                            } else {
                                return key;
                            }
                        }
                    }
                    if (languages[language][key]) {
                        return languages[language][key] || key;
                    } else {
                        if (config.onMissingKey) {
                             
                            const result = config.onMissingKey(key);
                            return result;
                        } else {
                             
                            return key;
                        }
                    }
                };
                return {
                    __: getkey,
                };
            },
        };
    },
};
 
export {Translator,i18n}
