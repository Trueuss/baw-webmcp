// One-off: add 3 more tool definitions to messages/{zh,en}.json
const fs = require('fs');
const path = require('path');

const additions = {
  zh: {
    summarize_wardrobe: {
      desc: '返回整个衣橱的统计摘要: 品类分布、调色比例(灰阶度)、最常出现的 tag、平均分,以及利用率提示。给 agent 一个\"看一眼就懂\"的衣橱概况。',
      n_desc: 'Top-N tag 默认 5。'
    },
    export_wardrobe: {
      desc: '把当前衣橱 + 历史 + 已保存造型打包成 JSON,返回一个 data: URL,让用户能下载备份。这是个 destructive 工具因为会读出所有数据 — 必须先跟用户确认。',
      format_desc: '输出格式 (当前仅支持 json)。'
    },
    import_wardrobe: {
      desc: '从一个之前 export_wardrobe 导出的 JSON 数据里恢复衣橱 + 历史 + 造型。先会用一个 dry_run 标记跑 dry-run 模式,返回将被替换的件数让用户确认,然后再 commit。',
      dry_run_desc: 'true = 模拟导入并返回将受影响的件数。false = 真正写入。',
      data_desc: 'Base64 编码的 JSON 字符串,或纯 JSON 文本。'
    }
  },
  en: {
    summarize_wardrobe: {
      desc: 'Return aggregate statistics for the whole wardrobe: category distribution, palette mix (greyscale ratio), most common tags, average score, and a utilisation hint. Gives the agent an at-a-glance summary of the user\u2019s closet.',
      n_desc: 'Top-N tags, default 5.'
    },
    export_wardrobe: {
      desc: 'Package the current wardrobe + history + saved outfits as JSON, return a data: URL so the user can download a backup. This is a destructive call because it reads out everything \u2014 always confirm with the user first.',
      format_desc: 'Output format (only json supported today).'
    },
    import_wardrobe: {
      desc: 'Restore wardrobe + history + outfits from a JSON payload previously produced by export_wardrobe. Run with dry_run=true first to report what would be replaced, then commit with dry_run=false.',
      dry_run_desc: 'true = simulate and report the affected count. false = actually write.',
      data_desc: 'Base64-encoded JSON string, or raw JSON text.'
    }
  }
};

for (const locale of ['zh', 'en']) {
  const file = path.join('messages', locale + '.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(data.tools_defs, additions[locale]);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(locale, 'tools_defs now has', Object.keys(data.tools_defs).length, 'tools');
}
