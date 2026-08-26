// One-off: inject tool definitions into messages/{zh,en}.json
const fs = require('fs');
const path = require('path');

const zh = {
  list_wardrobe: {
    desc: '返回用户的完整衣橱。在你想知道对方拥有什么之前,先调用这个——无论是为了推荐搭配、对比造型,还是解释某套组合为什么 work。',
    cat_desc: '可选: 仅返回该类目的衣物。',
    id_desc: 'list_wardrobe 返回的衣物 id。'
  },
  get_garment: {
    desc: '按 id 取单件衣物详情,包括面料、调色、笔记。在 list_wardrobe 之后用,当你需要某一件的完整细节时。'
  },
  add_garment: {
    desc: '把一件新衣物加入衣橱。必填: name / category / fabric。可选: tags / 调色(默认黑)/ 笔记。衣橱只在本地,不会离开浏览器。',
    white_desc: '0..1,调色中白色的占比。',
    black_desc: '0..1,调色中黑色的占比。',
    notes_desc: '可选备注。'
  },
  remove_garment: {
    desc: '永久删除一件衣物。是 destructive 操作,演示中无法撤销。务必先与人确认。'
  },
  analyze_outfit: {
    desc: '按 BAW 四个维度(silhouette / palette / texture / occasion)给一套衣物打分,返回 0-10 总分和每维度评语。当用户问"这身穿得怎么样"或你想提议某套组合让他考虑时,调用它。',
    ids_desc: '组成这套造型的衣物 id 列表。enum 随衣橱实时重建——你引用不了用户已经删掉的那一件。',
    occasion_desc: '可选: 场合上下文。'
  },
  propose_outfit: {
    desc: '根据场合和季节,从衣橱里生成一套推荐。返回选中的衣物 id 和一句话理由。当用户问"今天穿什么去 X"时,调用它。',
    focus_desc: '可选: 风格倾向。'
  },
  save_outfit: {
    desc: '把建议的造型持久化到用户的 lookbook,以便在 lookbook 页面查阅和后续引用。',
    notes_desc: '可选备注。'
  },
  list_history: {
    desc: '返回用户最近的 N 条会话记录——人的动作、agent 调用、系统事件的混合。用它把建议落地到刚刚发生的事("你两分钟前加了一件……")。'
  },
  get_session_state: {
    desc: '一次性快照当前 BAW 会话: 衣橱件数、保存的造型数、报告数、最近活动。在一轮对话开始时用它定位自己,避免多次读取调用。'
  },
  compare_outfits: {
    desc: '把两套造型在同样的四维度上打分,返回赢家。当用户在两套特定组合之间抉择时,用它。'
  },
  get_lookbook: {
    desc: '返回用户保存的造型,每条带预测分。在提议新东西时用来引用过去的 look。'
  },
  apply_suggestion: {
    desc: '通过写入 Style Lab 的选择区来应用推荐造型。Style Lab 页面(任何打开的 tab)通过本地事件总线接收变更,实时重算分数,UI 高亮已应用的建议。在 propose_outfit 之后,用户接受 agent 推荐时调用。',
    label_desc: '可选: 建议的标签。'
  }
};

const en = {
  list_wardrobe: {
    desc: "Return the user\u2019s full wardrobe. Call this first when you need to know what they own before proposing an outfit, comparing looks, or explaining why a particular combination works.",
    cat_desc: 'Optional: only return garments of this category.',
    id_desc: 'The garment id returned by list_wardrobe.'
  },
  get_garment: {
    desc: 'Fetch a single garment by its id, including fabric, palette mix, and notes. Use this after list_wardrobe when you need the full detail of one piece.'
  },
  add_garment: {
    desc: 'Add a new garment to the wardrobe. Required: name, category, fabric. Optional: tags, palette mix (defaults to black), notes. The wardrobe is local-only; nothing leaves the browser.',
    white_desc: '0..1 share of white in the palette.',
    black_desc: '0..1 share of black in the palette.',
    notes_desc: 'Optional notes.'
  },
  remove_garment: {
    desc: 'Permanently remove a garment from the wardrobe. This is destructive and cannot be undone in the demo. Always confirm with the human first.'
  },
  analyze_outfit: {
    desc: 'Score a set of garments on the four BAW axes \u2014 silhouette, palette, texture, occasion fit \u2014 and return an overall score 0-10 plus per-axis comments. Call this when the user asks \u201Chow does this look\u201D or when proposing a combination they should consider.',
    ids_desc: 'Garment ids that make up the outfit. The enum is rebuilt from the live wardrobe on every call \u2014 you cannot reference a piece the user has removed.',
    occasion_desc: 'Optional occasion context.'
  },
  propose_outfit: {
    desc: 'Generate a proposed outfit combination from the wardrobe for a given occasion and season. Returns the chosen garment ids and a one-line rationale. Call this when the user asks for a recommendation ("what should I wear for X?").',
    focus_desc: 'Optional style focus.'
  },
  save_outfit: {
    desc: 'Persist a proposed outfit to the user\u2019s outfit history so it shows up in the lookbook and can be referenced later.',
    notes_desc: 'Optional notes.'
  },
  list_history: {
    desc: 'Return the most recent N entries from the user\u2019s session history \u2014 a mix of human actions, agent calls, and system events. Use this to ground your suggestions in what just happened ("you added X two minutes ago...").'
  },
  get_session_state: {
    desc: 'Snapshot the current BAW session: how many garments, how many saved outfits, how many reports, the most recent activity. Use this at the start of a turn to orient yourself without burning multiple read calls.'
  },
  compare_outfits: {
    desc: 'Score two outfits side by side on the same four axes and return a winner. Use this when the user is choosing between two specific combinations.'
  },
  get_lookbook: {
    desc: 'Return the user\u2019s saved looks from the lookbook. Each entry includes the label, the garment ids, the occasion and season, and the predicted score (if analyze_outfit was run before saving). Use this to reference past looks when proposing something new.'
  },
  apply_suggestion: {
    desc: 'Apply a proposed outfit by writing the garment ids into the Style Lab selection. The Style Lab page (in any open tab) receives the change via the local event bus, recomputes the score live, and highlights the applied suggestion in the UI. Use this after propose_outfit when the user accepts the agent\u2019s recommendation.',
    label_desc: 'Optional label for the suggestion.'
  }
};

for (const locale of ['zh', 'en']) {
  const file = path.join('messages', locale + '.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.tools_defs = locale === 'zh' ? zh : en;
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(locale, 'tools_defs keys:', Object.keys(data.tools_defs).length);
}
