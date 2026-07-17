const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionsBitField,
  ChannelType
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

let Tesseract = null;
try {
  Tesseract = require("tesseract.js");
} catch {}

// ===================== CONFIG =====================
const TOKEN = process.env.DISCORD_TOKEN || "thay token";
const CLIENT_ID = "1471438810121375865";

const OWNER_IDS = ["1020868400672686080"];
const allowedUsers = ["1020868400672686080"];

// ===================== MULTI-SERVER CONFIG DATABASE =====================
const GUILD_CONFIG_FILE = "guild_configs.json";
let guildConfigs = {};

// Tự động đọc file cấu hình server nếu có
if (fs.existsSync(GUILD_CONFIG_FILE)) {
  try {
    guildConfigs = JSON.parse(fs.readFileSync(GUILD_CONFIG_FILE, "utf8"));
  } catch {
    guildConfigs = {};
  }
}

// Hàm lưu file cấu hình server
function saveGuildConfigs() {
  fs.writeFileSync(GUILD_CONFIG_FILE, JSON.stringify(guildConfigs, null, 2));
}

// Hàm bổ trợ lấy cấu hình riêng biệt của từng server
function getGuildConfig(guildId) {
  if (!guildConfigs[guildId]) {
    guildConfigs[guildId] = {
      allowedKeyChannels: [], // Kênh được gõ key của server này
      logChannels: []         // Kênh nhận nhật ký log của server này
    };
  }
  return guildConfigs[guildId];
}

const TIMEOUT_MS = 5 * 24 * 60 * 60 * 1000;

// ===================== TEMPLATES CONFIG =====================
// Mẫu mặc định cũ (ID: 1020868400672686080)
const TEMPLATE_OLD = [
 {
    name: "Setup-bot",
    type: "category",
    children: [
      { name: "✧₊˚🤖-𝙎𝙚𝙩𝙪𝙥-𝙗𝙤𝙩-₊˚✧", type: "text" },
      { name: "✧₊˚✧₊˚𝘼𝙪𝙩𝙤-𝙈𝙊𝘿-₊˚✧", type: "text" }
    ]
  },
  {
    name: "✧₊👋𝙬𝙚𝙡𝙘𝙤𝙢𝙚₊˚✧",
    type: "category",
    children: [
      { name: "✧₊👋𝙬𝙚𝙡𝙘𝙤𝙢𝙚₊˚✧", type: "text" },
      { name: "✧₊𝙍𝙪𝙡𝙚₊˚✧", type: "text" },
      { name: "✧₊˚🚀𝘽𝙤𝙤𝙨𝙩-𝙨𝙚𝙫𝙚𝙧₊˚✧", type: "text" }
    ]
  },
  {
    name: "✧₊˚📢𝘼𝙣𝙤𝙪𝙣𝙘𝙚₊˚✧",
    type: "category",
    children: [
      { name: "✧₊˚📢𝙉𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣₊˚✧", type: "text" },
      { name: "✧₊˚🚨𝙍𝙚𝙥𝙤𝙧𝙩₊˚✧", type: "text" },
      { name: "✧₊˚🆙-𝙇𝙚𝙫𝙚𝙡-₊˚✧", type: "text" }
    ]
  },
  {
    name: "✧₊˚🌎𝘾𝙝𝙖𝙩-₊˚✧",
    type: "category",
    children: [
      { name: "✧₊˚🇻🇳𝘾𝙝𝙖𝙩𝙑𝙉₊˚✧", type: "text" },
      { name: "✧₊˚🇬🇧-𝘾𝙝𝙖𝙩-𝙀𝙣𝙜𝙡𝙞𝙨𝙝-₊˚✧", type: "text" }
    ]
  },
  {
    name: "✧₊˚🎉𝙂𝙞𝙫𝙚 𝙖𝙬𝙖𝙮₊˚✧",
    type: "category",
    children: [
      { name: "✧₊˚🎉𝙂𝙞𝙫𝙚 𝙖𝙬𝙖𝙮₊˚✧", type: "text" },
      { name: "✧₊˚🥳𝘿𝙤𝙣𝙚-𝙂𝙞𝙫𝙚-𝙖𝙬𝙖𝙮₊˚✧", type: "text" }
    ]
  },
  {
    name: "✧₊˚🤖-𝘽𝙤𝙩-₊˚✧",
    type: "category",
    children: [
      { name: "✧₊˚📋-𝙆𝙝𝙤-𝙎𝙘𝙧𝙞𝙥𝙩₊˚✧", type: "text" },
      { name: "✧₊˚🤖-𝘾𝙝𝙖𝙩-𝘽𝙤𝙩-𝙎𝙘𝙧𝙞𝙥𝙩-₊˚✧", type: "text" },
      { name: "✧₊˚🤖-𝘽𝙮𝙥𝙖𝙨𝙨-𝙠𝙚𝙮-₊˚✧", type: "text" },
      { name: "share-script", type: "forum" }
    ]
  },
  {
    name: "✧₊˚📱𝘾𝙡𝙚𝙣𝙩 𝙖𝙣𝙙𝙧𝙤𝙞𝙙-₊˚✧",
    type: "category",
    children: [
      { name: "✧₊˚🇻🇳𝘿𝙚𝙡𝙩𝙖-𝙑𝙉𝙂-₊˚✧", type: "text" },
      { name: "✧₊˚🇻🇳𝘿𝙚𝙡𝙩𝙖-𝙑𝙉𝙂-𝙁𝙞𝙭𝙡𝙖𝙜-₊˚✧", type: "text" },
      { name: "✧₊˚🇻🇳𝘼𝙧𝙘𝙚𝙪𝙨-𝙑𝙉𝙂-₊˚✧", type: "text" }
    ]
  },
  {
    name: "✧₊˚🍎 𝘾𝙡𝙚𝙣𝙩 𝙄𝙊𝙎₊˚✧",
    type: "category",
    children: [
      { name: "✧₊˚🇻🇳𝘿𝙚𝙡𝙩𝙖-𝙑𝙉𝙂-₊˚✧", type: "text" },
    ]
  },
  {
    name: "🖥️ PC",
    type: "category",
    children: [
      { name: "✧₊˚💻-𝘾𝙡𝙚𝙣𝙩-𝙒𝙞𝙣𝙙𝙤𝙬₊˚✧", type: "text" }
    ]
  },
  {
    name: "✧₊˚💻-𝙃𝙖𝙘𝙠 𝙇𝙌-₊˚✧",
    type: "category",
    children: [
      { name: "✧₊˚📱-𝙃𝙖𝙘𝙠-𝙇𝙌-𝘼𝙣𝙙𝙧𝙤𝙞𝙙-𝟲𝟰𝘽𝙞𝙩-₊˚✧", type: "text" },
      { name: "✧₊˚📱-𝙃𝙖𝙘𝙠-𝙇𝙌-𝘼𝙣𝙙𝙧𝙤𝙞𝙙-𝟯𝟮𝘽𝙞𝙩-₊˚✧", type: "text" },
      { name: "✧₊˚🍎-𝙃𝙖𝙘𝙠-𝙇𝙌-𝙄𝙊𝙎-₊˚✧", type: "text" }
    ]
  },
  {
    name: "✧₊˚🔥-𝙃𝙖𝙘𝙠 𝙁𝙁 𝙄𝙊𝙎 -₊˚✧",
    type: "category",
    children: [
      { name: "✧₊˚🔥-𝙃𝙖𝙘𝙠-𝙁𝙁-𝙄𝙊𝙎-𝙄𝙋𝘼-₊˚✧", type: "text" }
    ]
  },
  {
    name: "✧₊˚📽️𝙑𝙞𝙙𝙚𝙤𝙨₊˚✧",
    type: "category",
    children: [
      { name: "✧₊˚🎥-𝙏𝙞𝙠𝙩𝙤𝙠₊˚✧", type: "text" },
      { name: "✧₊˚🎥-𝙔𝙤𝙪𝙩𝙪𝙗𝙚₊˚✧", type: "text" }
    ]
  },
  {
    name: "BF Notify",
    type: "category",
    children: [
      { name: "✧₊˚🍌-𝙎𝙩𝙤𝙘𝙠-𝙁𝙧𝙪𝙞𝙩𝙨-₊˚✧", type: "text" }
    ]
  },
  {
    name: "✧₊📁𝙇𝙞𝙣𝙝 𝙏𝙞𝙣𝙝₊˚✧",
    type: "category",
    children: [
      { name: "✧₊˚📺-𝙔𝙤𝙪𝙏𝙪𝙗𝙚-𝙋𝙧𝙚𝙢𝙞𝙪𝙢-𝙈𝙤𝙙₊˚✧", type: "text" },
      { name: "✧₊˚🎞️-𝘾𝙖𝙥𝘾𝙪𝙩-𝙋𝙧𝙚𝙢𝙞𝙪𝙢-𝙈𝙤𝙙₊˚✧", type: "text" },
      { name: "✧₊˚🎬-𝙉𝙚𝙩𝙛𝙡𝙞𝙭-𝙋𝙧𝙚𝙢𝙞𝙪𝙢-𝙈𝙤𝙙₊˚✧", type: "text" },
      { name: "✧₊˚🤖-𝘾𝙝𝙖𝙩𝙂𝙋𝙏-𝙋𝙧𝙚𝙢𝙞𝙪𝙢-𝙈𝙤𝙙₊˚✧", type: "text" },
      { name: "✧₊˚⛏️-𝙈𝙞𝙣𝙚𝙘𝙧𝙖𝙛𝙩-𝙈𝙤𝙙₊˚✧", type: "text" }
    ]
  },
  {
    name: "Thoại",
    type: "category",
    children: [
      { name: "Chung", type: "voice" },
      { name: "Chung", type: "voice" }
    ]
  }
];

// Mẫu danh mục kênh mới (ID: 1427887770298486899)
const TEMPLATE_NEW = [
  {
    name: "✧₊˚👋 𝗛𝗲𝗹𝗹𝗼 ˚₊✧",
    type: "category",
    children: [
      { name: "🚪-𝗚𝗮𝘁𝗲", type: "text" },
      { name: "👋-𝗪𝗲𝗹𝗰𝗼𝗺𝗲", type: "text" }
    ]
  },
  {
    name: "✧₊˚📢 𝗧𝗵𝗼̂𝗻𝗴 𝗕𝗮́𝗼 ˚₊✧",
    type: "category",
    children: [
      { name: "📢-𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻", type: "text" },
      { name: "🎥-𝗡𝗲𝘄-𝗩𝗶𝗱𝗲𝗼", type: "text" },
      { name: "💠-𝗚𝗲𝘁-𝗥𝗼𝗹𝗲", type: "text" },
      { name: "⏱️-𝗧𝘂𝘆𝗲̂̉𝗻-𝗡𝗵𝗮̂𝗻-𝗩𝗶𝗲̂𝗻", type: "text" },
      { name: "🚨-𝗟𝗼𝗴-𝗩𝗶-𝗣𝗵𝗮̣𝗺", type: "text" },
      { name: "💡-𝗟𝗲𝘃𝗲𝗹-𝗨𝗽", type: "text" },
      { name: "🎊-𝗧𝗵𝗼̂𝗻𝗴-𝗕𝗮́𝗼-𝗕𝗼𝗼𝘀𝘁𝗶𝗻𝗴", type: "text" },
      { name: "⚓-𝗟𝗲𝗮𝗱𝗲𝗿𝗯𝗼𝗮𝗿𝗱", type: "text" }
    ]
  },
  {
    name: "✧₊˚💬 𝗖𝗵𝗮𝘁 ˚₊✧",
    type: "category",
    children: [
      { name: "🌍-𝗖𝗵𝗮𝘁-𝗚𝗹𝗼𝗯𝗮𝗹", type: "text" },
      { name: "💬-𝗖𝗵𝗮𝘁-𝗩𝗶𝗲𝘁𝗻𝗮𝗺", type: "text" },
      { name: "💬-𝗖𝗵𝗮𝘁-𝗘𝗻𝗴𝗹𝗶𝘀𝗵", type: "text" }
    ]
  },
  {
    name: "✧₊˚🎉 𝗤𝘂𝗮̀ 𝗧𝗮̣̆𝗻𝗴 ˚₊✧",
    type: "category",
    children: [
      { name: "🎉-𝗚𝗶𝘃𝗲𝗮𝘄𝗮𝘆", type: "text" },
      { name: "✅-𝗗𝗼𝗻𝗲-𝗚𝗶𝘃𝗲𝗮𝘄𝗮𝘆", type: "text" }
    ]
  },
  {
    name: "✧₊˚🎫 𝗧𝗶𝗰𝗸𝗲𝘁 ˚₊✧",
    type: "category",
    children: [
      { name: "🎫-𝗧𝗮̣𝗼-𝗧𝗶𝗰𝗸𝗲𝘁-𝗖𝗮̀𝘆-𝗧𝗵𝘂𝗲̂", type: "text" }
    ]
  },
  {
    name: "✧₊˚🤖 𝗦𝗰𝗿𝗶𝗽𝘁-𝗛𝗮𝗰𝗸 ˚₊✧",
    type: "category",
    children: [
      { name: "🎮-𝗦𝗰𝗿𝗶𝗽𝘁", type: "text" },
      { name: "🧑‍💻-𝗦𝗰𝗿𝗶𝗽𝘁-𝗔𝗹𝗹-𝗚𝗮𝗺𝗲", type: "text" },
      { name: "🥶-𝗖𝗵𝗮𝘁-𝗦𝗰𝗿𝗶𝗽𝘁", type: "text" },
      { name: "🔑-𝗕𝘆𝗽𝗮𝘀𝘀-𝗞𝗲𝘆", type: "text" },
      { name: "🤖-𝗕𝗼𝘁-𝗖𝗠𝗗", type: "text" },
      { name: "✔️-𝗟𝗲̣̂𝗻𝗵-𝗖𝗵𝗮𝘁-𝗕𝗼𝘁", type: "text" }
    ]
  },
  {
    name: "✧₊˚💻 𝗖𝗹𝗶𝗲𝗻𝘁 𝗙𝗼𝗿 𝗥𝗕𝗟 ˚₊✧",
    type: "category",
    children: [
      { name: "🍎-𝗖𝗹𝗶𝗲𝗻𝘁-𝗜𝗢𝗦", type: "text" },
      { name: "📱-𝗖𝗹𝗶𝗲𝗻𝘁-𝗔𝗗𝗥", type: "text" },
      { name: "💻-𝗖𝗹𝗶𝗲𝗻𝘁-𝗣𝗖", type: "text" },
      { name: "☁️-𝗖𝗹𝗶𝗲𝗻𝘁-𝗖𝗹𝗼𝗻𝗲-𝗧𝗮𝗯", type: "text" }
    ]
  },
  {
    name: "✧₊˚🛡️ 𝗛𝗮𝗰𝗸 𝗡𝗧𝗙 ˚₊✧",
    type: "category",
    children: [
      { name: "📢-𝗦𝘁𝗮𝘁𝘂𝘀-𝗛𝗮𝗰𝗸", type: "text" },
      { name: "⬆️-𝗖𝗹𝗶𝗲𝗻𝘁-𝗨𝗽𝘁", type: "text" },
      { name: "🛠️-𝗥𝗼𝗯𝗹𝗼𝘅-𝗨𝗽𝗱𝗮𝘁𝗲-𝗩𝗲𝗿𝘀𝗶𝗼𝗻", type: "text" }
    ]
  },
  {
    name: "✧₊˚🔥 𝗛𝗮𝗰𝗸 𝗙𝗙 ˚₊✧",
    type: "category",
    children: [
      { name: "🍎-𝗛𝗮𝗰𝗸-𝗙𝗙-𝗜𝗢𝗦", type: "text" },
      { name: "📱-𝗛𝗮𝗰𝗸-𝗙𝗙-𝗔𝗗𝗥", type: "text" }
    ]
  },
  {
    name: "✧₊˚🎮 𝗠𝗶𝗻𝗲𝗰𝗿𝗮𝗳𝘁 𝗣𝗘 ˚₊✧",
    type: "category",
    children: [
      { name: "🍎-𝗠𝗶𝗻𝗲𝗰𝗿𝗮𝗳𝘁-𝗣𝗘-𝗜𝗢𝗦", type: "text" },
      { name: "📱-𝗠𝗶𝗻𝗲𝗰𝗿𝗮𝗳𝘁-𝗔𝗗𝗥", type: "text" }
    ]
  },
  {
    name: "✧₊˚🍎 𝗦𝘁𝗼𝗰𝗸 ˚₊✧",
    type: "category",
    children: [
      { name: "🍎-𝗦𝘁𝗼𝗰𝗸-𝗙𝗿𝘂𝗶𝘁", type: "text" }
    ]
  },
  {
    name: "✧₊˚🎮 𝗚𝗶𝗮̉𝗶 𝗧𝗿𝗶́ ˚₊✧",
    type: "category",
    children: [
      { name: "🏆-𝗡𝗼̂́𝗶-𝗧𝘂̛̀", type: "text" },
      { name: "🦀-𝗕𝗮̂̀𝘂-𝗖𝘂𝗮", type: "text" },
      { name: "🎰-𝗧𝗮̀𝗶-𝗫𝗶̉𝘂", type: "text" },
      { name: "🐟-𝗖𝗮̂𝘂-𝗖𝗮́", type: "text" },
      { name: "🌸-𝗧𝘂-𝗧𝗶𝗲̂𝗻", type: "text" }
    ]
  },
  {
    name: "Thoại",
    type: "category",
    children: [
      { name: "Chung", type: "voice" },
      { name: "Chung", type: "voice" }
    ]
  }
];

// ===================== ROLES CONFIGURATION =====================
// đổi toàn bộ mã màu Hex ngẫu nhiên đẹp mắt để tránh bị nói copy, phân quyền chuẩn bảo mật
const ROLES_DATA = [
  { name: "OWNER👑", color: "#FF3333", permissions: [PermissionsBitField.Flags.Administrator] },
  { name: "System Bot🤖", color: "#00E5FF", permissions: [PermissionsBitField.Flags.Administrator] },
  { name: "CO OWNER🕊️", color: "#FF5722", permissions: [PermissionsBitField.Flags.Administrator] },
  { name: "ADMIN🔥", color: "#FF1744", permissions: [PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.MoveMembers] },
  { name: "SUPPORTER👾", color: "#D500F9", permissions: [PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageMessages] },
  { name: "MANAGER👤", color: "#2979FF", permissions: [PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.MoveMembers] },
  { name: "STAFF☀️", color: "#FFEA00", permissions: [PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageMessages] },
  { name: "MUTED💢", color: "#757575", permissions: [] },
  { name: "UPDATE CLIENT🟢", color: "#00E676", permissions: [] },
  { name: "SHARE SCRIPT📱", color: "#37474F", permissions: [] },
  { name: "SELLER🤑", color: "#FFB300", permissions: [] },
  { name: "PREMIUM🧠", color: "#F50057", permissions: [] },
  { name: "FRIEND OWNER💠", color: "#00695C", permissions: [] },
  { name: "Share source⛩️", color: "#E65100", permissions: [] },
  { name: "BOOSTER🌸", color: "#F48FB1", permissions: [] },
  { name: "LGPT🌈", color: "#FF8A80", permissions: [] },
  { name: "Server Booster🚀", color: "#EA80FC", permissions: [] },
  { name: "HE", color: "#80D8FF", permissions: [] },
  { name: "SHE", color: "#FF80AB", permissions: [] },
  { name: "member", color: "#00efff", permissions: [], isMember: true }
];

// ===================== HELPER FUNCTIONS =====================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanOcrLine(line) {
  return (line || "").replace(/[\t\r]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeForGuess(text) {
  return cleanOcrLine(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

function mapChannelType(type) {
  switch ((type || "text").toLowerCase()) {
    case "category": return ChannelType.GuildCategory;
    case "voice": return ChannelType.GuildVoice;
    case "forum": return ChannelType.GuildForum;
    case "announcement": return ChannelType.GuildAnnouncement;
    default: return ChannelType.GuildText;
  }
}

function cloneOverwrites(channel) {
  return channel?.permissionOverwrites?.cache
    ? channel.permissionOverwrites.cache.map(ow => ({
        id: ow.id,
        allow: ow.allow.bitfield.toString(),
        deny: ow.deny.bitfield.toString()
      }))
    : [];
}

async function deleteAllChannels(guild) {
  const channels = await guild.channels.fetch();
  const sorted = [...channels.values()]
    .filter(Boolean)
    .sort((a, b) => (b.rawPosition ?? b.position ?? 0) - (a.rawPosition ?? a.position ?? 0));
  await Promise.allSettled(
    sorted.map(ch => ch?.deletable ? ch.delete("Reset server setup") : Promise.resolve())
  );
}

async function createChannel(guild, spec, parentId = null) {
  const options = {
    name: spec.name,
    type: mapChannelType(spec.type),
    parent: parentId || null
  };

  if (spec.overwrites) options.permissionOverwrites = spec.overwrites;

  if (spec.type === "text" || spec.type === "announcement" || spec.type === "forum") {
    if (spec.topic) options.topic = spec.topic;
    if (typeof spec.nsfw === "boolean") options.nsfw = spec.nsfw;
    if (typeof spec.slowmode === "number") options.rateLimitPerUser = spec.slowmode;
    if (typeof spec.autoArchiveDuration === "number") options.defaultAutoArchiveDuration = spec.autoArchiveDuration;
  }

  if (spec.type === "voice") {
    if (typeof spec.bitrate === "number") options.bitrate = spec.bitrate;
    if (typeof spec.userLimit === "number") options.userLimit = spec.userLimit;
  }

  return guild.channels.create(options);
}

async function buildTemplate(guild, template) {
  await deleteAllChannels(guild);
  for (const group of template) {
    const category = await createChannel(guild, {
      name: group.name,
      type: "category",
      overwrites: group.overwrites || []
    });
    const children = Array.isArray(group.children) ? group.children : [];
    for (const child of children) {
      await createChannel(guild, child, category.id);
      await sleep(120);
    }
    await sleep(160);
  }
}

async function cloneFromGuildId(client, targetGuild, sourceGuildId) {
  const sourceGuild = await client.guilds.fetch(sourceGuildId).catch(() => null);
  if (!sourceGuild) throw new Error("Bot không có mặt trong server nguồn hoặc ID sai.");

  const sourceChannels = await sourceGuild.channels.fetch();
  const channels = [...sourceChannels.values()]
    .filter(Boolean)
    .sort((a, b) => (a.rawPosition ?? a.position ?? 0) - (b.rawPosition ?? b.position ?? 0));
  await deleteAllChannels(targetGuild);

  const categoryMap = new Map();

  for (const ch of channels.filter(c => c.type === ChannelType.GuildCategory)) {
    const created = await targetGuild.channels.create({
      name: ch.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites: cloneOverwrites(ch)
    });
    categoryMap.set(ch.id, created.id);
    await sleep(100);
  }

  for (const ch of channels.filter(c => c.type !== ChannelType.GuildCategory)) {
    const parentId = ch.parentId ? (categoryMap.get(ch.parentId) || null) : null;

    const options = {
      name: ch.name,
      parent: parentId,
      permissionOverwrites: cloneOverwrites(ch),
      type: ch.type === ChannelType.GuildVoice ? ChannelType.GuildVoice :
            ch.type === ChannelType.GuildAnnouncement ? ChannelType.GuildAnnouncement :
            ch.type === ChannelType.GuildForum ? ChannelType.GuildForum : ChannelType.GuildText
    };
    if (options.type === ChannelType.GuildText || options.type === ChannelType.GuildAnnouncement || options.type === ChannelType.GuildForum) {
      if (ch.topic) options.topic = ch.topic;
      if (typeof ch.nsfw === "boolean") options.nsfw = ch.nsfw;
      if (typeof ch.rateLimitPerUser === "number") options.rateLimitPerUser = ch.rateLimitPerUser;
      if (typeof ch.defaultAutoArchiveDuration === "number") options.defaultAutoArchiveDuration = ch.defaultAutoArchiveDuration;
    }

    if (options.type === ChannelType.GuildVoice) {
      if (typeof ch.bitrate === "number") options.bitrate = ch.bitrate;
      if (typeof ch.userLimit === "number") options.userLimit = ch.userLimit;
    }

    await targetGuild.channels.create(options).catch(() => {});
    await sleep(90);
  }
}

async function ocrImageToText(imageUrl) {
  if (!Tesseract) return null;
  const res = await Tesseract.recognize(imageUrl, "eng+vie");
  return res?.data?.text || null;
}

function parseTemplateFromText(rawText) {
  const lines = String(rawText || "").split(/\r?\n/).map(cleanOcrLine).filter(Boolean);
  const template = [];
  let current = null;

  for (const line of lines) {
    const n = normalizeForGuess(line);
    const looksLikeCategory = line.length <= 40 && !n.startsWith("#") && !n.startsWith("🔊") && !n.startsWith("🎙") && !n.includes("http") && !n.match(/^\d+$/) && !n.includes("discord");
    if (looksLikeCategory && (current === null || current.children.length > 0 || template.length === 0)) {
      current = { name: line, type: "category", children: [] };
      template.push(current);
      continue;
    }

    if (!current) {
      current = { name: "Imported", type: "category", children: [] };
      template.push(current);
    }

    const isVoice = /voice|talk|room|call|chung|vocal|speaking/i.test(n);
    current.children.push({ name: line, type: isVoice ? "voice" : "text" });
  }

  return template.filter(group => group?.name && Array.isArray(group.children) && group.children.length);
}

async function buildFromImage(guild, attachmentUrl) {
  const text = await ocrImageToText(attachmentUrl).catch(() => null);
  const template = parseTemplateFromText(text || "");
  if (!template.length) {
    throw new Error("Không đọc được ảnh. Hãy dùng source_guild_id để clone chính xác.");
  }
  await buildTemplate(guild, template);
}

async function runSetup(interaction, { mode, sourceGuildId = null, image = null, templateId = null }) {
  if (!interaction.guild) {
    return interaction.reply({ content: "Lệnh này chỉ dùng trong server.", ephemeral: true });
  }

  await interaction.reply({
    content: "⏳ Đang tiến hành dọn dẹp và dựng cấu trúc các kênh theo yêu cầu. Vui lòng đợi...",
    ephemeral: true
  });

  try {
    if (mode === "owner") {
      if (templateId === "1427887770298486899") {
        await buildTemplate(interaction.guild, TEMPLATE_NEW);
      } else {
        await buildTemplate(interaction.guild, TEMPLATE_OLD);
      }
    } else if (mode === "guild") {
      await cloneFromGuildId(interaction.client, interaction.guild, sourceGuildId);
    } else if (mode === "image") {
      await buildFromImage(interaction.guild, image);
    } else {
      throw new Error("Thiếu thông tin cấu hình setup.");
    }

    return interaction.followUp({
      content: "<a:emoji_75:1524039622668189806>  Thiết lập cấu trúc hệ thống kênh thành công!",
      ephemeral: true
    });
  } catch (error) {
    console.error(error);
    return interaction.followUp({
      content: `<a:emoji_76:1524195723996823612> Gặp lỗi trong quá trình setup kênh: ${error.message}`,
      ephemeral: true
    });
  }
}

// ===================== VIDEO DOWNLOAD CONFIG =====================
const VIDEO_MAX_SIZE = 20 * 1024 * 1024;
const VIDEO_HEIGHTS = [720, 480, 360, 240];

// ===================== DATA STORAGE HANDLING =====================
let data = {};
let page = 1;

if (fs.existsSync("data.json")) {
  try {
    data = JSON.parse(fs.readFileSync("data.json", "utf8"));
  } catch {
    data = {};
  }
}

function save() {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

function normalize(t) {
  return (t || "").toLowerCase().trim().replace(/\s+/g, " ");
}

function stripVietnameseAccents(text) {
  return normalize(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { shell: false, stdio: options.stdio || "pipe", ...options });
    let stderr = "";
    if (child.stderr) {
      child.stderr.on("data", d => { stderr += d.toString(); });
    }
    child.on("error", reject);
    child.on("close", code => {
      if (code === 0) return resolve();
      reject(new Error(`${cmd} exited with code ${code}${stderr ? `: ${stderr}` : ""}`));
    });
  });
}

function findDownloadedFile(dir, baseName) {
  const files = fs.readdirSync(dir);
  return files.filter(f => f.startsWith(baseName + ".") && !f.endsWith(".part")).map(f => path.join(dir, f))[0] || null;
}

async function compressVideo(inputFile, outputFile) {
  await runCommand("ffmpeg", [
    "-y", "-i", inputFile, "-vf", "scale='min(854,iw)':-2", "-c:v", "libx264", "-preset", "veryfast",
    "-crf", "32", "-maxrate", "900k", "-bufsize", "1800k", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", outputFile
  ], { stdio: "pipe" });
}

async function downloadVideoWithFallback(url, tmpDir, baseName) {
  for (const h of VIDEO_HEIGHTS) {
    const outTemplate = path.join(tmpDir, `${baseName}.%(ext)s`);
    try {
      await runCommand("yt-dlp", [
        "--no-playlist", "--no-warnings", "--retries", "10", "--fragment-retries", "10", "--socket-timeout", "30",
        "--concurrent-fragments", "4", "-f", `bv*[height<=${h}]+ba/b[height<=${h}]/best`, "--merge-output-format", "mp4", "-o", outTemplate, url
      ], { stdio: "pipe" });
      const file = findDownloadedFile(tmpDir, baseName);
      if (file && fs.existsSync(file)) return file;
    } catch {}
  }
  return null;
}

async function handleVideo(msg, url) {
  const loading = await msg.reply("⏳ Đang tải video...");
  const tmpDir = fs.mkdtempSync(path.join(require("os").tmpdir(), "video-"));
  const baseName = `video_${Date.now()}`;

  try {
    await loading.edit("⬇️ Đang lấy video...");
    const downloadedFile = await downloadVideoWithFallback(url, tmpDir, baseName);
    if (!downloadedFile) {
      await loading.edit("<a:emoji_76:1524195723996823612> Không tải được video này.");
      return;
    }

    let fileToSend = downloadedFile;
    let size = fs.statSync(downloadedFile).size;
    if (size > VIDEO_MAX_SIZE) {
      await loading.edit("📦 Video quá lớn, đang nén lại...");
      const compressedFile = path.join(tmpDir, `${baseName}_compressed.mp4`);
      await compressVideo(downloadedFile, compressedFile);
      if (fs.existsSync(compressedFile)) {
        fileToSend = compressedFile;
        size = fs.statSync(compressedFile).size;
      }
    }

    if (size > VIDEO_MAX_SIZE) {
      await loading.edit("<a:emoji_76:1524195723996823612> Video vẫn quá lớn để gửi trực tiếp lên Discord.");
      return;
    }

    await loading.edit("📤 Đang gửi video...");
    await msg.channel.send({ files: [{ attachment: fileToSend, name: path.basename(fileToSend) }] });
    await loading.delete().catch(() => {});
  } catch {
    await loading.edit("<a:emoji_76:1524195723996823612> Tải video thất bại.").catch(() => {});
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

// ==========================================
// NAKNOHACK OBFUSCATOR CORE (LIGHTWEIGHT & FAST BASE64)
// ==========================================
const ObfConfig = {
    removeComments: true,
    minifyCode: true,
    watermark: "--// This file was created by Naknohack [https://discord.gg/uSWQ7rhpDp]"
};

class LuaLexer {
    static tokenize(code) {
        const tokens = [];
        let i = 0;
        while (i < code.length) {
            let char = code[i];
            if (char === '"' || char === "'") {
                let quote = char, str = quote;
                i++;
                while (i < code.length) {
                    str += code[i];
                    if (code[i] === '\\') { i++; str += code[i]; } 
                    else if (code[i] === quote) break;
                    i++;
                }
                tokens.push({ type: 'String', value: str });
                i++; continue;
            }
            if (char === '-' && code[i + 1] === '-') {
                let comment = "--"; i += 2;
                if (code[i] === '[' && code[i + 1] === '[') {
                    comment += "[["; i += 2;
                    while (i < code.length && !(code[i] === ']' && code[i + 1] === ']')) { comment += code[i]; i++; }
                    comment += "]]"; i += 2;
                } else {
                    while (i < code.length && code[i] !== '\n') { comment += code[i]; i++; }
                }
                tokens.push({ type: 'Comment', value: comment });
                continue;
            }
            if (/\s/.test(char)) {
                let space = char; i++;
                while (i < code.length && /\s/.test(code[i])) { space += code[i]; i++; }
                tokens.push({ type: 'Whitespace', value: space });
                continue;
            }
            tokens.push({ type: 'Other', value: char }); i++;
        }
        return tokens;
    }
}

class CodeTransformer {
    static process(sourceCode, config) {
        const tokens = LuaLexer.tokenize(sourceCode);
        let transformedCode = [];
        for (let token of tokens) {
            if (config.removeComments && token.type === 'Comment') continue;
            if (config.minifyCode && token.type === 'Whitespace') { transformedCode.push(" "); continue; }
            transformedCode.push(token.value);
        }
        return transformedCode.join("").trim();
    }
}

class VMCompiler {
    static randVar(len) {
        const chars = 'IlO0'; let res = '_';
        for(let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
        return res;
    }

    static compile(sourceCode, config) {
        const xorKey = Math.floor(Math.random() * 250) + 1;
        let utf8str = unescape(encodeURIComponent(sourceCode));
        let xored = "";
        for (let i = 0; i < utf8str.length; i++) {
            xored += String.fromCharCode(utf8str.charCodeAt(i) ^ xorKey);
        }
        
        // Node.js dùng Buffer thay cho btoa trong một số môi trường, nhưng để giữ đúng logic 100%, 
        // ta dùng hàm btoa tích hợp của Node.js 18+ (hoặc Buffer b64)
        const b64Encoded = typeof btoa === "function" ? btoa(xored) : Buffer.from(xored, 'binary').toString('base64');

        const outBuilder = [];
        if (config.watermark) outBuilder.push(config.watermark);

        const keyV = this.randVar(6); const b64V = this.randVar(7); const bxorV = this.randVar(5);
        const decFunc = this.randVar(6); const tamperV = this.randVar(5); const decTbl = this.randVar(5);

        outBuilder.push(`local ${tamperV}=0`);
        outBuilder.push(`if iscclosure and not iscclosure(loadstring) then ${tamperV}=1 end`);
        outBuilder.push(`local ${keyV}=${xorKey}+(${tamperV}*256)`);
        outBuilder.push(`local ${b64V}="${b64Encoded}"`);
        outBuilder.push(`local ${bxorV}=bit32 and bit32.bxor or bit and bit.bxor or function(a,b) local p,c=1,0 while a>0 and b>0 do local ra,rb=a%2,b%2 if ra~=rb then c=c+p end a,b,p=(a-ra)/2,(b-rb)/2,p*2 end return c+a*p+b*p end`);
        outBuilder.push(`local function ${decFunc}(data, key)`);
        outBuilder.push(`  local b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'`);
        outBuilder.push(`  local ${decTbl}={} for i=1,64 do ${decTbl}[string.byte(b,i)]=i-1 end`);
        outBuilder.push(`  data=string.gsub(data,'[^A-Za-z0-9+/=]','')`);
        outBuilder.push(`  local chars={} local j=1`);
        outBuilder.push(`  for i=1,#data,4 do`);
        outBuilder.push(`    local c1=${decTbl}[string.byte(data,i)] or 0`);
        outBuilder.push(`    local c2=${decTbl}[string.byte(data,i+1)] or 0`);
        outBuilder.push(`    local c3=${decTbl}[string.byte(data,i+2)] or 0`);
        outBuilder.push(`    local c4=${decTbl}[string.byte(data,i+3)] or 0`);
        outBuilder.push(`    local bit24=(c1*262144)+(c2*4096)+(c3*64)+c4`);
        outBuilder.push(`    local b1=math.floor(bit24/65536)`);
        outBuilder.push(`    local b2=math.floor(bit24/256)%256`);
        outBuilder.push(`    local b3=bit24%256`);
        outBuilder.push(`    chars[j]=string.char(${bxorV}(b1,key))`);
        outBuilder.push(`    if string.byte(data,i+2)==61 then break end`);
        outBuilder.push(`    chars[j+1]=string.char(${bxorV}(b2,key))`);
        outBuilder.push(`    if string.byte(data,i+3)==61 then break end`);
        outBuilder.push(`    chars[j+2]=string.char(${bxorV}(b3,key))`);
        outBuilder.push(`    j=j+3`);
        outBuilder.push(`  end`);
        outBuilder.push(`  return table.concat(chars)`);
        outBuilder.push(`end`);
        outBuilder.push(`local _f,_e=pcall(function() return loadstring(${decFunc}(${b64V},${keyV}))() end)`);
        outBuilder.push(`if not _f then return end`);
        
        return outBuilder.join("\n");
    }
}

// ===================== CLIENT CUSTOMIZATION =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers // Bắt buộc bật để chạy Auto Add Role Member khi người dùng tham gia
  ]
});

// ===================== SLASH COMMAND BUILDER =====================
const commands = [
  new SlashCommandBuilder()
    .setName("them")
    .setDescription("Thêm key")
    .addStringOption(o => o.setName("key").setDescription("Tên key").setRequired(true))
    .addStringOption(o => o.setName("value").setDescription("Nội dung").setRequired(true)),

  new SlashCommandBuilder()
    .setName("sua")
    .setDescription("Sửa key")
    .addStringOption(o => o.setName("key").setDescription("Tên key").setRequired(true))
    .addStringOption(o => o.setName("value").setDescription("Nội dung").setRequired(true)),

  new SlashCommandBuilder()
    .setName("xoa")
    .setDescription("Xóa key")
    .addStringOption(o => o.setName("key").setDescription("Tên key").setRequired(true)),

  new SlashCommandBuilder()
    .setName("server-working")
    .setDescription("Chỉ dành cho Chủ Bot"),
  
  new SlashCommandBuilder()
    .setName("announcement")
    .setDescription("Gửi thông báo tới toàn bộ kênh ở các server (Chỉ Chủ Bot)")
    .addStringOption(o => o.setName("message").setDescription("Nội dung thông báo").setRequired(true))
    .addChannelOption(o => o.setName("log").setDescription("Chọn kênh tại Server Mẹ để nhận nhật ký log").setRequired(true)),
    
  new SlashCommandBuilder()
    .setName("list")
    .setDescription("Danh sách key"),

  new SlashCommandBuilder()
    .setName("obfuscator")
    .setDescription("Mã hóa mã nguồn Lua (Ai cũng dùng được)")
    .addStringOption(o => o.setName("method").setDescription("Chọn phương thức nhận mã").setRequired(true)
      .addChoices(
        { name: "File", value: "file" },
        { name: "Code", value: "code" },
        { name: "Link", value: "link" }
      ))
    .addAttachmentOption(o => o.setName("file").setDescription("File mã nguồn (NẾU CHỌN FILES)"))
    .addStringOption(o => o.setName("code").setDescription("Dán trực tiếp code vào đây (NẾU CHỌN CODE)"))
    .addStringOption(o => o.setName("link").setDescription("Đường link chứa code (NẾU CHỌN LINKS)")),
    
      new SlashCommandBuilder()
    .setName("bypass")
    .setDescription("Bypass link để lấy key tự động")
    .addStringOption(o => 
      o.setName("link")
      .setDescription("Dán link cần bypass vào đây")
      .setRequired(true)
    ),
    
new SlashCommandBuilder()
  .setName("capquyenkenh")
  .setDescription("Cấu hình kênh sử dụng Key và kênh nhận Log nhật ký (Chỉ Admin hoặc Chủ Bot)")
  .addStringOption(o => o.setName("hanh_dong").setDescription("Chọn thao tác cài đặt").setRequired(true)
    .addChoices(
      { name: "Kênh được quyền chat script", value: "add_key" },
      { name: "xóa kênh được quyền chat script", value: "remove_key" },
      { name: "cấp quyền kênh log chat script sai kênh", value: "add_log" },
      { name: "xóa kênh log chat script sai kênh", value: "remove_log" },
      { name: "Xem cấu hình server hiện tại", value: "view" }
    ))
  .addChannelOption(o => o.setName("kenh").setDescription("Chọn kênh cần thiết lập").setRequired(false)),

  new SlashCommandBuilder()
    .setName("reset-server")
    .setDescription("Xóa toàn bộ cấu hình kênh gõ key và kênh log của bot tại server này (Chỉ Admin/Owner)"),
    
  new SlashCommandBuilder()
    .setName("setupclent")
    .setDescription("Xóa kênh cũ và dựng cấu trúc danh mục theo ID mẫu cung cấp")
    .addStringOption(o => 
      o.setName("id")
        .setDescription("Nhập ID mẫu (1020868400672686080: Mẫu cũ | 1427887770298486899: Mẫu mới)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setupserver")
    .setDescription("Xóa kênh cũ và clone server từ ID hoặc ảnh chụp")
    .addStringOption(o => o.setName("source_guild_id").setDescription("ID server nguồn nếu bot có mặt ở đó").setRequired(false))
    .addAttachmentOption(o => o.setName("image").setDescription("Ảnh chụp toàn bộ danh sách kênh").setRequired(false)),

  new SlashCommandBuilder()
    .setName("taovaitro")
    .setDescription("Tự động tạo toàn bộ danh sách vai trò (Roles) đã cấu hình phân quyền chống lạm quyền")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.once("clientReady", async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("🔥 Bot trực tuyến và đã cập nhật Slash Commands mới!");
  } catch (err) {
    console.error("<a:emoji_76:1524195723996823612> Lỗi đăng ký slash commands:", err);
  }
});

// ===================== KEY LIST DISPLAY =====================
function makeListEmbed() {
  const keys = Object.keys(data);
  const per = 5;
  const max = Math.max(1, Math.ceil(keys.length / per));

  if (page > max) page = max;
  if (page < 1) page = 1;

  const start = (page - 1) * per;
  const list = keys.slice(start, start + per).map((k, i) => `🔑 ${start + i + 1}. ${k}`).join("\n");
  return new EmbedBuilder()
    .setColor("#5865F2")
    .setDescription(list || "<a:emoji_76:1524195723996823612> Không có dữ liệu data")
    .setFooter({ text: `Trang ${page}/${max}` });
}

function listButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("search").setLabel("🔎").setStyle(ButtonStyle.Success)
  );
}

// ===================== MUTING AND LOGGING SYSTEM =====================
async function logMute(msg, reason, type) {
  if (!msg.guild) return;
  const isKey = type === "KEY";
  const embed = new EmbedBuilder()
    .setColor(isKey ? "#f1c40f" : "#ff0000")
    .setTitle(isKey ? "🔑 Timeout do dùng script sai kênh" : "🚨 Timeout do spam / phá server")
    .addFields(
      { name: "Người bị xử lý", value: `${msg.member} (${msg.author.id})`, inline: false },
      { name: "Kênh", value: `${msg.channel}`, inline: false },
      { name: "Phân loại", value: isKey ? "Dùng script sai kênh" : "Spam", inline: true },
      { name: "Nguyên nhân", value: reason || "Không rõ", inline: true },
      { name: "Thời lượng", value: `${Math.floor(TIMEOUT_MS / 1000 / 60 / 60 / 24)} ngày`, inline: true },
      { name: "Nội dung tin nhắn", value: `\`\`\`\n${(msg.content || "").slice(0, 900) || "(Trống)"}\n\`\`\`\n`, inline: false }
    )
    .setTimestamp();

  const sCfg = getGuildConfig(msg.guild.id); // Lấy cấu hình của server hiện tại
for (const channelId of sCfg.logChannels) {
  try {
    const logChannel = msg.guild.channels.cache.get(channelId) || (await msg.guild.channels.fetch(channelId).catch(() => null));
    if (!logChannel) continue;
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch {}
}

async function applyTimeout(msg, reason, type) {
  if (!msg.member) return false;
  
  // Kiểm tra nếu là các vai trò quản trị an toàn thì bỏ qua hình phạt (Bypass)
  const safeRoles = ["OWNER", "ADMIN", "STAFF", "CO OWNER", "MANAGER", "SUPPORTER"];
  const isSafe = msg.member.roles.cache.some(r => safeRoles.some(s => r.name.toUpperCase().includes(s)));
  if (isSafe) return false;

  const me = msg.guild.members.me;
  if (!me) return false;

  const canTimeout = msg.member.moderatable && me.permissions.has(PermissionsBitField.Flags.ModerateMembers);
  if (!canTimeout) {
    await logMute(msg, reason, type).catch(() => {});
    return false;
  }

  await msg.member.timeout(TIMEOUT_MS, reason).catch(() => {});
  await logMute(msg, reason, type).catch(() => {});
  return true;
}

// ===================== EVENT: AUTO ADD ROLE MEMBER =====================
client.on("guildMemberAdd", async (member) => {
  try {
    const roleSpec = ROLES_DATA.find(r => r.isMember);
    if (!roleSpec) return;

    const role = member.guild.roles.cache.find(r => r.name === roleSpec.name);
    if (role) {
      await member.roles.add(role, "Hệ thống tự động cấp vai trò cho thành viên mới tham gia").catch(console.error);
    }
  } catch (err) {
    console.error("Lỗi tự động thêm role thành viên:", err);
  }
});

// ===================== MESSAGES HANDLING =====================
client.on("messageCreate", async msg => {
 try {
   if (msg.author.bot || !msg.guild) return;
      // ====================================================================
   // AUTO BYPASS (Cảm biến tự động kích hoạt khi có link)
   // ====================================================================
   const bypassMatch = msg.content.match(/https:\/\/auth\.platorelay\.com\/a\?d=[^\s]+/);
   if (bypassMatch) {
     const url = bypassMatch[0]; // Bắt chính xác nguyên đường link
     const startTime = Date.now(); 
     const apiKey = "6bp_948931f141bae7134d8d7763fe67395f"; 

     // 1. Gửi UI Loading ngay lập tức
     const loadingEmbed = new EmbedBuilder()
       .setColor("#2b2d31")
       .setTitle("<a:emoji_78:1526470876567044136>Bypassing...") 
       .setDescription("Đang tiến hành lấy key tự động, vui lòng chờ trong giây lát...");
       
     const responseMsg = await msg.reply({ 
       content: `<@${msg.author.id}>`, 
       embeds: [loadingEmbed] 
     });

     // 2. Gọi API để lấy Key
     try {
       const apiUrl = `https://6bypass.nyxoriavn.workers.dev/api/v1/bypass?url=${encodeURIComponent(url)}&api_key=${apiKey}`;
       const response = await fetch(apiUrl, { method: 'GET' });
       
       if (!response.ok) {
         throw new Error(`API trả về mã lỗi: ${response.status}`);
       }

       const rawData = await response.text();
       let resultText = rawData.trim();

       // Xử lý JSON nếu có
       try {
         const jsonObj = JSON.parse(rawData);
         resultText = (jsonObj.result || jsonObj.key || jsonObj.bypassed || rawData).trim(); 
       } catch (e) {}

       if (!resultText || resultText === "") {
          throw new Error("API không trả về kết quả nào.");
       }

       const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

       // 3. Edit UI thành kết quả (Giống hệt lệnh bypass thủ công)
       const resultEmbed = new EmbedBuilder()
         .setColor("#2b2d31")
         .setTitle("<a:emoji_75:1524039622668189806> Bypass Success")
         .setDescription("Your key has been retrieved. Copy it and input it into the application.")
         .addFields(
           { name: "Mobile Version", value: resultText }, 
           { name: "PC Version", value: `\`\`\`text\n${resultText}\n\`\`\`` }
         )
         .setFooter({ 
           text: `Auto-Bypassed for ${msg.author.username} • ⏱️ ${executionTime}s`, 
           iconURL: msg.author.displayAvatarURL() 
         });

       return await responseMsg.edit({ 
         content: `<@${msg.author.id}>`, 
         embeds: [resultEmbed] 
       });

     } catch (error) {
       console.error("Lỗi khi tự động Bypass:", error);
       
       const errorEmbed = new EmbedBuilder()
         .setColor("#FF0000")
         .setTitle("<a:emoji_76:1524195723996823612> Bypass Thất Bại")
         .setDescription(`Có lỗi xảy ra trong quá trình lấy key.\n**Chi tiết lỗi:** \`${error.message}\``);

       return await responseMsg.edit({ 
         content: `<@${msg.author.id}>`, 
         embeds: [errorEmbed] 
       });
     }
   }
   // ================= END AUTO BYPASS =================
   
   const text = normalize(msg.content);

   // ===== TRẢ KEY VÀ KIỂM TRA KÊNH CHUNG CHO CÁC SERVER =====
   if (text && data[text]) {
     const sCfg = getGuildConfig(msg.guild.id); // Lấy cấu hình riêng của server này
     
     // Nếu server đã thiết lập kênh gõ key cụ thể, thì bắt buộc phải gõ đúng kênh đó
     if (sCfg.allowedKeyChannels.length > 0 && !sCfg.allowedKeyChannels.includes(msg.channel.id)) {
       const muted = await applyTimeout(msg, "Dùng key ở kênh không cho phép", "KEY");
       if (muted) {
         await msg.reply("<a:emoji_76:1524195723996823612> Bạn đã bị khóa mõm (timeout) vì sử dụng key sai kênh quy định.").catch(() => {});
       } else {
         await msg.reply("<a:emoji_76:1524195723996823612> Không được sử dụng key ở kênh này! Vui lòng dùng đúng kênh.").catch(() => {});
       }
       return;
     }

      const raw = String(data[text]).replace(/```/g, "");

      return msg.reply({
        embeds: [
          new EmbedBuilder().setColor("#00ff99").setTitle(`🔑 ${text}`).setDescription(`\`\`\`\n${raw}\n\`\`\`\n`)
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`copy_pc_${text}`).setLabel("💻 Copy PC").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`copy_mobile_${text}`).setLabel("📱 Copy Mobile").setStyle(ButtonStyle.Success)
          )
        ]
      });
    }

    // ===== TỰ ĐỘNG BẮT LINK VIDEO =====
    const match = msg.content.match(/https?:\/\/[^\s]+/);
    if (!match) return;

    const url = match[0];
    if (!["tiktok", "facebook", "instagram", "youtu"].some(x => url.includes(x))) return;

    await handleVideo(msg, url);
  } catch (err) {
    console.error("Lỗi xử lý tin nhắn messageCreate:", err);
  }
});

// ===================== INTERACTIONS EXECUTION =====================
client.on("interactionCreate", async i => {
  try {
    if (i.isChatInputCommand()) {
                // ====================================================================
      // LỆNH BYPASS (Fix lỗi copy dư dấu nháy trên Mobile, Trim khoảng trắng)
      // ====================================================================
      if (i.commandName === "bypass") {
        const startTime = Date.now(); 
        const link = i.options.getString("link");
        const apiKey = "6bp_948931f141bae7134d8d7763fe67395f"; 

        // --------------------------------------------------
        // GIAI ĐOẠN 1: Gửi UI chờ (Loading)
        // --------------------------------------------------
        const loadingEmbed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("<a:emoji_78:1526470876567044136>Bypassing...") 
          .setDescription("Đang tiến hành lấy key, vui lòng chờ trong giây lát...");
          
        await i.reply({ 
          content: `<@${i.user.id}>`, 
          embeds: [loadingEmbed] 
        });

        // --------------------------------------------------
        // GIAI ĐOẠN 2: Gọi API và Đổi UI thành Kết quả
        // --------------------------------------------------
        try {
          const apiUrl = `https://6bypass.nyxoriavn.workers.dev/api/v1/bypass?url=${encodeURIComponent(link)}&api_key=${apiKey}`;
          const response = await fetch(apiUrl, { method: 'GET' });
          
          if (!response.ok) {
            throw new Error(`API trả về mã lỗi: ${response.status}`);
          }

          const rawData = await response.text();
          
          // Dùng .trim() để dọn dẹp sạch sẽ khoảng trắng/dấu xuống dòng dư từ API
          let resultText = rawData.trim();

          // Xử lý JSON nếu có
          try {
            const jsonObj = JSON.parse(rawData);
            resultText = (jsonObj.result || jsonObj.key || jsonObj.bypassed || rawData).trim(); 
          } catch (e) {}

          if (!resultText || resultText === "") {
             throw new Error("API không trả về kết quả nào.");
          }

          const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

          // Tạo UI Kết quả: Sửa Mobile Version thành text trơn để copy mượt nhất
          const resultEmbed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("<a:emoji_75:1524039622668189806> Bypass Success")
            .setDescription("Your key has been retrieved. Copy it and input it into the application.")
            .addFields(
              { name: "Mobile Version", value: resultText }, // Đã xóa dấu ` ở đây
              { name: "PC Version", value: `\`\`\`text\n${resultText}\n\`\`\`` }
            )
            .setFooter({ 
              text: `Requested by ${i.user.username} • ⏱️ ${executionTime}s`, 
              iconURL: i.user.displayAvatarURL() 
            });

          // Thay thế khung Loading thành khung Kết quả
          return i.editReply({ 
            content: `<@${i.user.id}>`, 
            embeds: [resultEmbed] 
          });

        } catch (error) {
          console.error("Lỗi khi dùng lệnh Bypass:", error);
          
          const errorEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("<a:emoji_76:1524195723996823612> Bypass Thất Bại")
            .setDescription(`Có lỗi xảy ra trong quá trình lấy key.\n**Chi tiết lỗi:** \`${error.message}\``);

          return i.editReply({ 
            content: `<@${i.user.id}>`, 
            embeds: [errorEmbed] 
          });
        }
      }
      
            // ====================================================================
      // LỆNH OBFUSCATOR CHO TẤT CẢ MỌI NGƯỜI
      // ====================================================================
      if (i.commandName === "obfuscator") {
        await i.deferReply({ ephemeral: false }); // Lệnh công khai
        
        const method = i.options.getString("method");
        let rawCode = "";
        let fileName = "obfuscated.lua";

        try {
          if (method === "file") {
            const file = i.options.getAttachment("file");
            if (!file || !file.name.endsWith('.lua') && !file.name.endsWith('.txt')) {
              return i.editReply("<a:emoji_76:1524195723996823612> Vui lòng đính kèm một file `.lua` hoặc `.txt` hợp lệ vào mục tùy chọn `file`.");
            }
            const res = await fetch(file.url);
            rawCode = await res.text();
            fileName = `Obf_${file.name}`;
          } 
          else if (method === "code") {
            rawCode = i.options.getString("code");
            if (!rawCode) {
              return i.editReply("<a:emoji_76:1524195723996823612> Bạn đã chọn phương thức Code nhưng lại để trống ô `code`.");
            }
            fileName = `Obf_${Date.now()}.lua`;
          } 
          else if (method === "link") {
            const link = i.options.getString("link");
            if (!link || !link.startsWith("http")) {
              return i.editReply("<a:emoji_76:1524195723996823612> Bạn đã chọn phương thức Links, vui lòng cung cấp một đường link hợp lệ tại ô `link`.");
            }
            const res = await fetch(link);
            rawCode = await res.text();
            fileName = `Obf_${Date.now()}.lua`;
          }

          if (!rawCode.trim()) {
            return i.editReply("<a:emoji_76:1524195723996823612> Nội dung mã nguồn bị trống, không thể obfuscate.");
          }

          // Chạy bộ máy Obfuscator
          const cleanCode = CodeTransformer.process(rawCode, ObfConfig);
          const finalCode = VMCompiler.compile(cleanCode, ObfConfig);

          // Chuyển string thành dạng RAM Buffer thay vì lưu xuống ổ cứng
          const buffer = Buffer.from(finalCode, "utf-8");

          // Trả kết quả (Sau khi hàm kết thúc, biến buffer sẽ tự động bị dọn dẹp khỏi RAM)
          await i.editReply({
            content: "<a:emoji_75:1524039622668189806>  **Mã hóa thành công!** Đây là file của bạn:",
            files: [{ attachment: buffer, name: fileName }]
          });

        } catch (error) {
          console.error("Lỗi Obfuscator:", error);
          await i.editReply("<a:emoji_76:1524195723996823612> Có lỗi hệ thống xảy ra khi thực hiện mã hóa: " + error.message);
        }
        
        return; // Dừng lại ở đây, không chạy các lệnh bên dưới
      }
      
      // 1. Lệnh thiết lập kênh tự động phân tách theo mẫu ID (Chỉ Chủ Bot)
      if (i.commandName === "setupclent") {
        if (!OWNER_IDS.includes(i.user.id)) {
          return i.reply({ content: "<a:emoji_76:1524195723996823612> Lệnh này độc quyền dành cho chủ sở hữu bot.", ephemeral: true });
        }
        const targetId = i.options.getString("id");
        if (targetId !== "1020868400672686080" && targetId !== "1427887770298486899") {
          return i.reply({ content: "<a:emoji_76:1524195723996823612> ID mẫu không hợp lệ! Chỉ chấp nhận `1020868400672686080` (Mẫu cũ) hoặc `1427887770298486899` (Mẫu mới).", ephemeral: true });
        }
        return runSetup(i, { mode: "owner", templateId: targetId });
      }

      // 2. Lệnh tự động tạo danh sách vai trò bảo mật (Chỉ Chủ Bot)
      if (i.commandName === "taovaitro") {
        if (!OWNER_IDS.includes(i.user.id)) {
          return i.reply({ content: "<a:emoji_76:1524195723996823612> Lệnh này độc quyền dành cho chủ sở hữu bot.", ephemeral: true });
        }
        await i.reply({ content: "⏳ Đang dọn dẹp các vai trò cũ và thiết lập bộ Vai trò (Roles) mới bảo mật hoàn chỉnh. Xin chờ...", ephemeral: true });
        
        try {
          const currentRoles = await i.guild.roles.fetch();
          for (const role of currentRoles.values()) {
            if (role.name !== "@everyone" && !role.managed && role.editable) {
              await role.delete().catch(() => {});
            }
          }
          
          // Tạo tuần tự từ thấp lên cao để đảm bảo đúng thứ tự hiển thị
          const orderedRoles = [...ROLES_DATA].reverse();
          for (const spec of orderedRoles) {
            await i.guild.roles.create({
              name: spec.name,
              color: spec.color,
              permissions: spec.permissions,
              reason: "Chạy lệnh tự động hóa tạo vai trò an toàn chống lạm quyền"
            });
            await sleep(100);
          }
          
          return i.followUp({ content: "<a:emoji_75:1524039622668189806>  Đã tự động khởi tạo thành công toàn bộ hệ thống vai trò mới không sợ trùng lặp/copy và được phân quyền cực kỳ an toàn!", ephemeral: true });
        } catch (err) {
          console.error(err);
          return i.followUp({ content: `<a:emoji_76:1524195723996823612> Thất bại khi tạo vai trò: ${err.message}`, ephemeral: true });
        }
      }

      // ====================================================================
      // LỆNH THÔNG BÁO TOÀN DIỆN - KHÓA MỤC TIÊU TẠI SERVER MẸ
      // ====================================================================
      if (i.commandName === "announcement") {
        // 1. Kiểm tra quyền chủ bot
        if (!OWNER_IDS.includes(i.user.id)) {
          return i.reply({ content: "<a:emoji_76:1524195723996823612> Lệnh này độc quyền dành cho chủ sở hữu bot.", ephemeral: true });
        }

        const motherGuildId = "1499212510375579668";

        // 2. Chốt chặn an toàn: Bắt buộc phải đứng ở Server Mẹ mới được bấm lệnh
        if (i.guildId !== motherGuildId) {
          return i.reply({ 
            content: `<a:emoji_76:1524195723996823612> Vui lòng quay về **Server Mẹ** để thực hiện lệnh!\n*(Điều này giúp danh sách chọn kênh hiển thị chính xác các kênh của Server Mẹ, tránh gửi lộn đi nơi khác).*`, 
            ephemeral: true 
          });
        }
        
        // Hoãn phản hồi để bot có thời gian quét data gửi tin nhắn
        await i.deferReply({ ephemeral: true });
        
        const messageContent = i.options.getString("message");
        const logChannelInput = i.options.getChannel("log"); // Kênh lấy từ tùy chọn người dùng gõ

        // 3. Chốt chặn thứ hai: Xác thực lại kênh được chọn có thuộc Server Mẹ hay không
        const motherGuild = i.client.guilds.cache.get(motherGuildId) || await i.client.guilds.fetch(motherGuildId).catch(() => null);
        if (!motherGuild) {
           return i.editReply({ content: "<a:emoji_76:1524195723996823612> Không tìm thấy dữ liệu của Server Mẹ trên hệ thống bot." });
        }

        const logChannel = motherGuild.channels.cache.get(logChannelInput.id);
        if (!logChannel) {
           return i.editReply({ content: "<a:emoji_76:1524195723996823612> Lỗi bảo mật: Kênh được chọn không nằm trong Server Mẹ!" });
        }

        let successCount = 0;
        let logDetails = [];

        // 4. Quét cơ sở dữ liệu guildConfigs (từ file guild_configs.json) để rải thông báo
        for (const [gId, config] of Object.entries(guildConfigs)) {
          if (config.allowedKeyChannels && config.allowedKeyChannels.length > 0) {
             const guild = i.client.guilds.cache.get(gId) || await i.client.guilds.fetch(gId).catch(() => null);
             if (!guild) continue; 
             
             for (const chId of config.allowedKeyChannels) {
               try {
                 const channel = guild.channels.cache.get(chId) || await guild.channels.fetch(chId).catch(() => null);
                 if (channel && channel.isTextBased()) {
                   await channel.send(messageContent);
                   successCount++;
                   logDetails.push(`- Kênh <#${chId}> (Server: **${guild.name}** | ID: \`${guild.id}\`)`);
                 }
               } catch (err) {
                 // Bỏ qua nếu bot bị chặn quyền nhắn tin ở một server khách cụ thể nào đó
               }
             }
          }
        }

        // 5. Tiến hành gửi sớ Log báo cáo chi tiết về kênh má đã chọn ở Server Mẹ
        try {
          await logChannel.send(`📢 **Nhật ký thông báo:** Đã gửi thông báo hàng loạt đến **${successCount}** kênh được cấp quyền gõ key.\n**Nội dung:** ${messageContent}`);
          
          if (logDetails.length > 0) {
            // Chia nhỏ danh sách phòng trường hợp vượt quá giới hạn 2000 ký tự của Discord
            const chunks = logDetails.join('\n').match(/[\s\S]{1,1900}/g) || [];
            for (const chunk of chunks) {
               await logChannel.send(`**Danh sách các kênh đã nhận tin nhắn:**\n${chunk}`);
            }
          }
        } catch (err) {
          console.error("Lỗi gửi log thông báo:", err);
          return i.editReply({ content: `⚠️ Đã rải thông báo thành công đến ${successCount} kênh. Tuy nhiên bot thiếu quyền viết tin nhắn (Send Messages) vào kênh log ${logChannel} má vừa chọn!` });
        }

        return i.editReply({ content: `<a:emoji_75:1524039622668189806>  Tiến trình hoàn tất! Đã gửi thông báo tới ${successCount} kênh và chốt an toàn dữ liệu log về kênh ${logChannel} tại Server Mẹ.` });
      }
      
      // 3. Lệnh setup server (Đã sửa: Chỉ dành riêng cho Chủ Bot theo yêu cầu)
      if (i.commandName === "setupserver") {
        if (!OWNER_IDS.includes(i.user.id)) {
          return i.reply({ content: "<a:emoji_76:1524195723996823612> Lệnh setup server độc quyền dành cho Chủ sở hữu Bot.", ephemeral: true });
        }

        const sourceGuildId = i.options.getString("source_guild_id");
        const image = i.options.getAttachment("image");

        if (sourceGuildId) return runSetup(i, { mode: "guild", sourceGuildId });
        if (image?.url) return runSetup(i, { mode: "image", image: image.url });
        return i.reply({ content: "<a:emoji_76:1524195723996823612> Vui lòng điền source_guild_id hoặc đính kèm tệp hình ảnh.", ephemeral: true });
      }

            // ====================================================================
      // BẢO MẬT RIÊNG CHO CÁC LỆNH DATA KEY & LỆNH CHỦ BOT
      // ====================================================================
      // Chỉ giới hạn Chủ bot cho them, sua, xoa và server-working. Mọi người đều có thể dùng list.
      const ownerOnlyCommands = ["them", "sua", "xoa", "server-working"];

      if (ownerOnlyCommands.includes(i.commandName)) {
        if (!OWNER_IDS.includes(i.user.id)) {
          return i.reply({
            content: "<a:emoji_76:1524195723996823612> Lệnh quản trị hệ thống dữ liệu này độc quyền dành cho Chủ sở hữu Bot.",
            ephemeral: true
          });
        }
      }
      
    
      const key = i.options.getString("key") ? normalize(i.options.getString("key")) : "";
      const value = i.options.getString("value");

      if (i.commandName === "them") {
        data[key] = value;
        save();
        return i.reply({ content: "<a:emoji_75:1524039622668189806>  Thêm dữ liệu key thành công!", ephemeral: true });
      }

      if (i.commandName === "sua") {
        data[key] = value;
        save();
        return i.reply({ content: "✏️ Cập nhật dữ liệu sửa đổi thành công!", ephemeral: true });
      }

      if (i.commandName === "xoa") {
        delete data[key];
        save();
        return i.reply({ content: "🗑️ Xóa dữ liệu key thành công!", ephemeral: true });
      }

      if (i.commandName === "list") {
        page = 1;
        return i.reply({ embeds: [makeListEmbed()], components: [listButtons()], ephemeral: true });
      }
    }

    if (i.isButton()) {
      if (i.customId === "next") page++;
      if (i.customId === "prev") page--;

      if (i.customId === "next" || i.customId === "prev") {
        return i.update({ embeds: [makeListEmbed()], components: [listButtons()] });
      }

      if (i.customId === "search") {
        const modal = new ModalBuilder().setCustomId("searchModal").setTitle("🔎 Tìm kiếm dữ liệu key");
        const input = new TextInputBuilder().setCustomId("query").setLabel("Nhập tên key cần tìm").setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return i.showModal(modal);
      }

      if (i.customId.startsWith("copy_pc_")) {
        const key = i.customId.replace("copy_pc_", "");
        return i.reply({ content: `\`\`\`\n${String(data[key] || "")}\n\`\`\`\n`, ephemeral: true });
      }

      if (i.customId.startsWith("copy_mobile_")) {
        const key = i.customId.replace("copy_mobile_", "");
        return i.reply({ content: String(data[key] || ""), ephemeral: true });
      }
    }

    if (i.isModalSubmit()) {
      if (i.customId === "searchModal") {
        const q = normalize(i.fields.getTextInputValue("query"));
        const results = Object.keys(data).filter(k => k.includes(q));
        return i.reply({ content: results.length ? results.join("\n") : "<a:emoji_76:1524195723996823612> Không tìm thấy kết quả nào trùng khớp.", ephemeral: true });
      }
    }
  } catch (err) {
    console.error("Lỗi trong tiến trình interactionCreate:", err);
  }
  
        if (i.commandName === "server-working") {
        // Trả lời ẩn tạm thời để tránh bot bị hiện tượng "Interaction failed" do quét dữ liệu lâu
        await i.deferReply({ ephemeral: true });

        const targetGuildId = "1499212510375579668";
        let resultMessage = "📊 **DANH SÁCH SERVER BOT ĐANG HOẠT ĐỘNG:**\n\n";
        let count = 0;

        // Vòng lặp quét qua toàn bộ server bot đang tham gia
        for (const [guildId, guild] of i.client.guilds.cache) {
          // Kiểm tra xem bạn (Chủ Bot) có mặt trong server đó không
          const isOwnerInGuild = await guild.members.fetch(i.user.id).catch(() => null);
          if (isOwnerInGuild) continue; // Nếu có bạn ở đó rồi -> Bỏ qua đúng yêu cầu!

          let inviteLink = "Không có quyền tạo link mời (CreateInstantInvite)";
          try {
            // Tìm kênh chat đầu tiên bot có quyền tạo link mời công khai
            const channel = guild.channels.cache.find(c => 
              c.type === ChannelType.GuildText && 
              c.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.CreateInstantInvite)
            );
            if (channel) {
              const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
              inviteLink = invite.url;
            }
          } catch (err) {}

          resultMessage += `🔹 **${guild.name}** (ID: ${guild.id}) - *${guild.memberCount} thành viên*\n🔗 Link: ${inviteLink}\n\n`;
          count++;
        }

        if (count === 0) {
          resultMessage += "Không có server nào hoạt động mà không có mặt chủ bot.";
        }

        // Tìm server đích theo ID bạn cấp để gửi vào
        const targetGuild = i.client.guilds.cache.get(targetGuildId);
        if (!targetGuild) {
          return i.editReply({ content: `<a:emoji_76:1524195723996823612> Bot hiện tại không có mặt trong server đích (ID: ${targetGuildId}) để gửi log.` });
        }

                // Thay ID kênh cụ thể (ví dụ kênh #log-server) thuộc server 1499212510375579668 vào đây
        const logChannelId = "1499987535982755950"; // Bạn nhớ copy ID của KÊNH rồi dán vào đây nhé!
        
        const targetChannel = targetGuild.channels.cache.get(logChannelId);

        if (!targetChannel) {
          return i.editReply({ content: `<a:emoji_76:1524195723996823612> Không tìm thấy KÊNH có ID ${logChannelId} trong server đích.` });
        }

        if (!targetChannel.permissionsFor(targetGuild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
          return i.editReply({ content: `<a:emoji_76:1524195723996823612> Bot không có quyền gửi tin nhắn (Send Messages) vào kênh <#${logChannelId}>.` });
        }


        if (!targetChannel) {
          return i.editReply({ content: `<a:emoji_76:1524195723996823612> Tìm thấy server đích nhưng bot không có quyền gửi tin nhắn vào bất kỳ kênh text nào ở đó.` });
        }

        // Cắt nhỏ tin nhắn nếu danh sách dài quá 2000 ký tự (Giới hạn của Discord)
        const chunks = resultMessage.match(/[\s\S]{1,1900}/g) || [];
        for (const chunk of chunks) {
          await targetChannel.send(chunk);
        }

        return i.editReply({ content: `<a:emoji_75:1524039622668189806>  Đã quét xong! Đã gửi danh sách gồm ${count} server về kênh ${targetChannel} của server đích thành công.` });
      }
      
  
  if (i.commandName === "capquyenkenh") {
  // Đúng yêu cầu: Chủ Bot HOẶC Admin/Owner của server có quyền Administrator/ManageGuild đều dùng được
  const isBotOwner = OWNER_IDS.includes(i.user.id);
  const isAdmin = i.memberPermissions?.has(PermissionsBitField.Flags.Administrator) || i.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild);
  
  if (!isBotOwner && !isAdmin) {
    return i.reply({ content: "<a:emoji_76:1524195723996823612> Bạn phải là Chủ sở hữu Bot hoặc có quyền Quản trị viên (Admin) của Server này để thực hiện.", ephemeral: true });
  }

  const action = i.options.getString("hanh_dong");
  const targetChannel = i.options.getChannel("kenh");
  const guildId = i.guild.id;
  const sCfg = getGuildConfig(guildId);

  // Thao tác xem cấu hình hiện tại
  if (action === "view") {
    const keyChs = sCfg.allowedKeyChannels.map(id => `<#${id}>`).join(", ") || "Chưa thiết lập (Có thể gõ ở bất kỳ kênh nào)";
    const logChs = sCfg.logChannels.map(id => `<#${id}>`).join(", ") || "Chưa thiết lập";
    
    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle(`⚙️ Cấu hình Server: ${i.guild.name}`)
      .addFields(
        { name: "🔑 kênh được phép chat bot script", value: keyChs },
        { name: "🚨 kênh log chat script sai kênh", value: logChs }
      )
      .setTimestamp();
    return i.reply({ embeds: [embed], ephemeral: true });
  }

  // Đối với các hành động khác thì bắt buộc phải chọn kênh
  if (!targetChannel) {
    return i.reply({ content: "<a:emoji_76:1524195723996823612> Vui lòng chọn một kênh cụ thể để thực hiện hành động này.", ephemeral: true });
  }

  if (action === "add_key") {
    if (!sCfg.allowedKeyChannels.includes(targetChannel.id)) {
      sCfg.allowedKeyChannels.push(targetChannel.id);
      saveGuildConfigs();
    }
    return i.reply({ content: `<a:emoji_75:1524039622668189806>  Đã thêm kênh ${targetChannel} vào danh sách được gõ Key cho server này.`, ephemeral: true });
  }

  if (action === "remove_key") {
    sCfg.allowedKeyChannels = sCfg.allowedKeyChannels.filter(id => id !== targetChannel.id);
    saveGuildConfigs();
    return i.reply({ content: `<a:emoji_75:1524039622668189806>  Đã xóa kênh ${targetChannel} khỏi danh sách được gõ Key.`, ephemeral: true });
  }

  if (action === "add_log") {
    if (!sCfg.logChannels.includes(targetChannel.id)) {
      sCfg.logChannels.push(targetChannel.id);
      saveGuildConfigs();
    }
    return i.reply({ content: `<a:emoji_75:1524039622668189806>  Đã thiết lập kênh ${targetChannel} làm kênh nhận Log cho server này.`, ephemeral: true });
  }

  if (action === "remove_log") {
    sCfg.logChannels = sCfg.logChannels.filter(id => id !== targetChannel.id);
    saveGuildConfigs();
    return i.reply({ content: `<a:emoji_75:1524039622668189806> Đã xóa kênh ${targetChannel} khỏi danh sách nhận Log.`, ephemeral: true });
  }
}

    if (i.commandName === "reset-server") {
      // 1. Kiểm tra quyền: Phải là Chủ server (Owner) hoặc có quyền Quản trị viên / Quản lý Server
      const isServerOwner = i.user.id === i.guild.ownerId;
      const isAdmin = i.memberPermissions?.has(PermissionsBitField.Flags.Administrator) || i.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild);

      if (!isServerOwner && !isAdmin) {
        return i.reply({ 
          content: "<a:emoji_76:1524195723996823612> Chỉ có Chủ phòng (Owner) hoặc Admin của Server này mới được sử dụng lệnh này.", 
          ephemeral: true 
        });
      }

      // 2. Thực hiện xóa cấu hình của server hiện tại
      if (guildConfigs[i.guildId]) {
        delete guildConfigs[i.guildId]; // Xóa dữ liệu của server này khỏi biến object
        saveGuildConfigs();             // Lưu lại vào file json
      }

      // 3. Thông báo thành công
      return i.reply({ 
        content: "🔄 **Đã Reset thành công!** Toàn bộ cấu hình kênh gõ Key và kênh nhận Log tại server này đã bị xóa.\nBot đã quay về trạng thái chờ cài đặt. Vui lòng dùng lệnh `/cauhinhkenh` để thiết lập lại từ đầu.", 
        ephemeral: true 
      });
    }
    
});

// ===================== KHỞI CHẠY BOT =====================
if (!TOKEN || TOKEN === "Thay Token") {
  console.error("<a:emoji_76:1524195723996823612>Thiết lập cấu hình lỗi: Thiếu DISCORD_TOKEN hoặc chưa thay giá trị!");
  process.exit(1);
}
client.login(TOKEN);
