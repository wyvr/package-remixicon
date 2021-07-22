const fs = require('fs');
const { Logger } = require('@lib/logger');

// plugin to reduce the size of the remixicons
// by searching unused icons and removing them
const used_remixicons = [];

module.exports = {
    inject: {
        after: async (err, config, file, content, head, body) => {
            // search for all used icons
            const matches = content.match(/["\s]ri-[^\s"]+/g);
            if (matches) {
                matches
                    .map((match) => match.replace(/^./, ''))
                    .forEach((match) => {
                        if (used_remixicons.indexOf(match) == -1) {
                            used_remixicons.push(match);
                        }
                    });
            }
            return [err, config, file, content, head, body];
        },
    },
    optimize: {
        before: async (...args) => {
            // write used icons file
            Logger.debug(`[package-remixicon] use ${used_remixicons.length} icons`);
            const used_regex = new RegExp(`${used_remixicons.join('|')}`);
            const remixicon_file = 'gen/assets/remixicon/remixicon.css';
            if (!fs.existsSync(remixicon_file)) {
                Logger.error(`[package-remixicon] file does not exist ${remixicon_file}`);
                return args;
            }
            let removed = 0;
            const content = fs
                .readFileSync(remixicon_file, { encoding: 'utf-8' })
                .split('\n')
                .filter((line) => {
                    if (line.trim().indexOf('.ri-') != 0 || (used_remixicons.length > 0 && line.match(used_regex))) {
                        return true;
                    }
                    removed++;
                    return false;
                })
                .join('\n');
            Logger.debug(`[package-remixicon] remove ${removed} lines from css file`);
            if (content) {
                fs.writeFileSync('gen/assets/remixicon/remixicon.used.css', content);
            }
            return args;
        },
    }
};
