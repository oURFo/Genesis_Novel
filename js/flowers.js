/* ============================================
   花圃數學園 - Flower Definitions & Garden Logic
   ============================================ */

const STAGE_THRESHOLDS = [0, 10, 20, 30, 50];
const STAGE_NAMES = ['種子', '發芽', '長葉', '花苞', '開花'];

/* ------------------------------------------------------------------ */
/*  SVG builder helpers                                                 */
/* ------------------------------------------------------------------ */
function soil(y = 54) {
  return `<ellipse cx="28" cy="${y}" rx="22" ry="5" class="fl-soil"/>
          <ellipse cx="28" cy="${y-1}" rx="18" ry="3" class="fl-soil-light" opacity=".5"/>`;
}

function seedShape() {
  return `<ellipse cx="28" cy="48" rx="8" ry="6" class="fl-seed"/>
          <ellipse cx="26" cy="46" rx="3" ry="2" class="fl-seed-inner" opacity=".5"/>`;
}

function stemLine(x1=28,y1=48,x2=28,y2=20, cls='fl-stem') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
}

function leafPair(stemX,stemY,dir=1) {
  const lx = stemX + dir*12;
  return `<ellipse cx="${lx}" cy="${stemY}" rx="10" ry="5" class="fl-leaf" transform="rotate(${dir>0?-25:25},${lx},${stemY})"/>`;
}

/* ------------------------------------------------------------------ */
/*  16 Flower Definitions                                               */
/* ------------------------------------------------------------------ */
const FLOWERS = [

  /* 1. 向日葵 Sunflower ─ 數數 */
  {
    id: 'sunflower', name: '數數', chineseName: '向日葵', icon: '🌻',
    difficulty: 1, color: '#ffc107',
    svgs: [
      /* stage 0 – seed */
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      /* stage 1 – sprout */
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,32)}
        <ellipse cx="28" cy="28" rx="7" ry="5" class="fl-sprout"/>
      </svg>`,
      /* stage 2 – leaves */
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        ${leafPair(28,38,1)}${leafPair(28,30,-1)}
      </svg>`,
      /* stage 3 – bud */
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,16)}
        ${leafPair(28,38,1)}${leafPair(28,28,-1)}
        <circle cx="28" cy="12" r="8" fill="#5d4037"/>
        <circle cx="28" cy="12" r="6" fill="#795548"/>
      </svg>`,
      /* stage 4 – bloom */
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24)}
        ${leafPair(28,40,1)}${leafPair(28,34,-1)}
        <g transform="translate(28,18)">
          ${[0,45,90,135,180,225,270,315].map(a=>`<ellipse cx="${Math.round(Math.sin(a*Math.PI/180)*11)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*11)}" rx="5" ry="3" fill="#ffc107" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="7" fill="#5d4037"/>
          <circle cx="0" cy="0" r="5" fill="#795548"/>
          <circle cx="-1" cy="-1" r="2" fill="#4e342e" opacity=".6"/>
        </g>
      </svg>`
    ]
  },

  /* 2. 雛菊 Daisy ─ 比較 */
  {
    id: 'daisy', name: '比較', chineseName: '雛菊', icon: '🌼',
    difficulty: 1, color: '#fff9c4',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,34)}
        <ellipse cx="28" cy="30" rx="6" ry="4" class="fl-sprout"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        ${leafPair(28,38,1)}${leafPair(28,30,-1)}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,16)}
        ${leafPair(28,38,1)}
        <ellipse cx="28" cy="12" rx="9" ry="7" fill="#e0e0e0"/>
        <circle cx="28" cy="12" r="4" fill="#ffee58"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,22)}
        ${leafPair(28,40,1)}${leafPair(28,33,-1)}
        <g transform="translate(28,16)">
          ${[0,40,80,120,160,200,240,280,320].map(a=>`<ellipse cx="${Math.round(Math.sin(a*Math.PI/180)*10)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*10)}" rx="4" ry="2.5" fill="#fff9c4" stroke="#ddd" stroke-width=".5" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="5" fill="#ffee58"/>
        </g>
      </svg>`
    ]
  },

  /* 3. 蒲公英 Dandelion ─ 分與合 */
  {
    id: 'dandelion', name: '分與合', chineseName: '蒲公英', icon: '🌬️',
    difficulty: 2, color: '#eeeeee',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,34,'fl-stem-thin')}
        <ellipse cx="28" cy="31" rx="5" ry="3" fill="#aed581"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20,'fl-stem-thin')}
        <ellipse cx="18" cy="35" rx="9" ry="4" fill="#aed581" transform="rotate(-30,18,35)"/>
        <ellipse cx="38" cy="32" rx="9" ry="4" fill="#aed581" transform="rotate(30,38,32)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18,'fl-stem-thin')}
        <ellipse cx="18" cy="36" rx="9" ry="4" fill="#aed581" transform="rotate(-30,18,36)"/>
        <ellipse cx="38" cy="33" rx="9" ry="4" fill="#aed581" transform="rotate(30,38,33)"/>
        <circle cx="28" cy="14" r="10" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="1"/>
        <circle cx="28" cy="14" r="3" fill="#fdd835"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24,'fl-stem-thin')}
        <ellipse cx="18" cy="38" rx="9" ry="4" fill="#aed581" transform="rotate(-30,18,38)"/>
        <ellipse cx="38" cy="36" rx="9" ry="4" fill="#aed581" transform="rotate(30,38,36)"/>
        <g transform="translate(28,16)">
          ${[0,36,72,108,144,180,216,252,288,324].map(a=>`<line x1="0" y1="0" x2="${Math.round(Math.sin(a*Math.PI/180)*12)}" y2="${Math.round(-Math.cos(a*Math.PI/180)*12)}" stroke="#bdbdbd" stroke-width=".8"/>
            <circle cx="${Math.round(Math.sin(a*Math.PI/180)*12)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*12)}" r="2" fill="white" stroke="#bdbdbd" stroke-width=".5"/>`).join('')}
          <circle cx="0" cy="0" r="3" fill="#fdd835"/>
        </g>
      </svg>`
    ]
  },

  /* 4. 牽牛花 Morning Glory ─ 圖形 */
  {
    id: 'morning-glory', name: '圖形', chineseName: '牽牛花', icon: '🌺',
    difficulty: 1, color: '#9575cd',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        <path d="M28 48 Q24 38 22 30 Q26 26 30 30 Q32 38 28 48" fill="#a5d6a7" class="fl-stem"/>
        <ellipse cx="24" cy="26" rx="6" ry="4" fill="#81c784"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        <path d="M28 48 Q22 36 20 24" stroke="#52b788" stroke-width="2.5" fill="none"/>
        <ellipse cx="14" cy="36" rx="10" ry="5" fill="#66bb6a" transform="rotate(-40,14,36)"/>
        <ellipse cx="32" cy="28" rx="10" ry="5" fill="#66bb6a" transform="rotate(20,32,28)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        <path d="M28 48 Q22 36 20 22" stroke="#52b788" stroke-width="2.5" fill="none"/>
        <ellipse cx="14" cy="36" rx="10" ry="5" fill="#66bb6a" transform="rotate(-40,14,36)"/>
        <ellipse cx="32" cy="28" rx="10" ry="5" fill="#66bb6a" transform="rotate(20,32,28)"/>
        <ellipse cx="20" cy="16" rx="9" ry="7" fill="#9575cd" opacity=".8"/>
        <circle cx="20" cy="16" r="4" fill="#ede7f6"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        <path d="M28 48 Q22 36 20 24" stroke="#52b788" stroke-width="2.5" fill="none"/>
        <ellipse cx="14" cy="38" rx="10" ry="5" fill="#66bb6a" transform="rotate(-40,14,38)"/>
        <ellipse cx="34" cy="30" rx="10" ry="5" fill="#66bb6a" transform="rotate(20,34,30)"/>
        <g transform="translate(20,18)">
          <path d="M0,-10 Q8,-6 9,4 Q4,10 0,10 Q-4,10 -9,4 Q-8,-6 0,-10Z" fill="#9575cd"/>
          <path d="M0,-8 Q6,-4 7,3 Q3,8 0,8 Q-3,8 -7,3 Q-6,-4 0,-8Z" fill="#b39ddb"/>
          <circle cx="0" cy="0" r="4" fill="#ede7f6"/>
          <circle cx="0" cy="0" r="2" fill="#7e57c2"/>
        </g>
      </svg>`
    ]
  },

  /* 5. 櫻花 Cherry Blossom ─ 加法 */
  {
    id: 'cherry', name: '加法(10內)', chineseName: '櫻花', icon: '🌸',
    difficulty: 2, color: '#f8bbd9',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="6" ry="4" fill="#c8e6c9"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,22)}
        ${leafPair(28,38,1)}${leafPair(28,31,-1)}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        ${leafPair(28,38,1)}${leafPair(28,30,-1)}
        <circle cx="28" cy="14" r="8" fill="#f8bbd9"/>
        <circle cx="28" cy="14" r="5" fill="#f48fb1"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,26)}
        ${leafPair(28,40,1)}${leafPair(28,33,-1)}
        <g transform="translate(28,18)">
          ${[0,72,144,216,288].map(a=>`<path d="M0,-9 Q${Math.round(Math.sin((a+36)*Math.PI/180)*5)},${Math.round(-Math.cos((a+36)*Math.PI/180)*5)} ${Math.round(Math.sin(a*Math.PI/180)*9)},${Math.round(-Math.cos(a*Math.PI/180)*9)} Q${Math.round(Math.sin((a-36)*Math.PI/180)*5)},${Math.round(-Math.cos((a-36)*Math.PI/180)*5)} 0,-9Z" fill="#f8bbd9" transform="rotate(${a})" opacity=".9"/>`).join('')}
          <circle cx="0" cy="0" r="3" fill="#e91e63"/>
          ${[0,72,144,216,288].map(a=>`<line x1="0" y1="0" x2="${Math.round(Math.sin(a*Math.PI/180)*5)}" y2="${Math.round(-Math.cos(a*Math.PI/180)*5)}" stroke="#f48fb1" stroke-width=".8"/>`).join('')}
        </g>
      </svg>`
    ]
  },

  /* 6. 玫瑰 Rose ─ 減法 */
  {
    id: 'rose', name: '減法(10內)', chineseName: '玫瑰', icon: '🌹',
    difficulty: 2, color: '#ef5350',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="5" ry="4" fill="#a5d6a7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="18" cy="35" rx="10" ry="5" fill="#388e3c" transform="rotate(-25,18,35)"/>
        <path d="M22 28 Q20 22 24 18 Q28 16 30 20 Q28 26 22 28Z" fill="#388e3c"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="18" cy="36" rx="10" ry="5" fill="#388e3c" transform="rotate(-25,18,36)"/>
        <path d="M22 28 Q20 22 24 18 Q28 16 30 20 Q28 26 22 28Z" fill="#388e3c"/>
        <path d="M28 10 Q32 14 30 20 Q26 22 22 18 Q24 12 28 10Z" fill="#ef5350"/>
        <path d="M28 10 Q24 14 26 20 Q30 22 34 18 Q32 12 28 10Z" fill="#c62828" opacity=".8"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,26)}
        <ellipse cx="18" cy="38" rx="10" ry="5" fill="#388e3c" transform="rotate(-25,18,38)"/>
        <path d="M22 32 Q20 24 26 20 Q30 18 32 22 Q30 30 22 32Z" fill="#388e3c"/>
        <g transform="translate(28,18)">
          <ellipse cx="0" cy="-5" rx="7" ry="5" fill="#ef5350"/>
          <ellipse cx="5" cy="2" rx="6" ry="5" fill="#ef5350" transform="rotate(120)"/>
          <ellipse cx="-5" cy="2" rx="6" ry="5" fill="#ef5350" transform="rotate(-120)"/>
          <ellipse cx="0" cy="-3" rx="5" ry="4" fill="#c62828"/>
          <ellipse cx="0" cy="-1" rx="3" ry="2.5" fill="#b71c1c"/>
          <circle cx="0" cy="0" r="2" fill="#fce4ec"/>
        </g>
      </svg>`
    ]
  },

  /* 7. 薰衣草 Lavender ─ 時間 */
  {
    id: 'lavender', name: '時間', chineseName: '薰衣草', icon: '💜',
    difficulty: 1, color: '#b39ddb',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33,'fl-lav-stem')}
        <ellipse cx="28" cy="30" rx="4" ry="5" fill="#b39ddb" opacity=".5"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20,'fl-lav-stem')}
        <line x1="28" y1="35" x2="18" y2="30" stroke="#7e57c2" stroke-width="1.5" fill="none"/>
        <line x1="28" y1="35" x2="38" y2="30" stroke="#7e57c2" stroke-width="1.5" fill="none"/>
        <ellipse cx="18" cy="28" rx="5" ry="3" fill="#aed581" transform="rotate(-30,18,28)"/>
        <ellipse cx="38" cy="28" rx="5" ry="3" fill="#aed581" transform="rotate(30,38,28)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18,'fl-lav-stem')}
        <line x1="28" y1="36" x2="18" y2="31" stroke="#7e57c2" stroke-width="1.5" fill="none"/>
        <line x1="28" y1="36" x2="38" y2="31" stroke="#7e57c2" stroke-width="1.5" fill="none"/>
        <ellipse cx="18" cy="29" rx="5" ry="3" fill="#aed581" transform="rotate(-30,18,29)"/>
        <ellipse cx="38" cy="29" rx="5" ry="3" fill="#aed581" transform="rotate(30,38,29)"/>
        <rect x="24" y="10" width="8" height="10" rx="4" fill="#b39ddb"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20,'fl-lav-stem')}
        <line x1="28" y1="37" x2="17" y2="32" stroke="#7e57c2" stroke-width="1.5" fill="none"/>
        <line x1="28" y1="37" x2="39" y2="32" stroke="#7e57c2" stroke-width="1.5" fill="none"/>
        <ellipse cx="17" cy="30" rx="5" ry="3" fill="#aed581" transform="rotate(-30,17,30)"/>
        <ellipse cx="39" cy="30" rx="5" ry="3" fill="#aed581" transform="rotate(30,39,30)"/>
        <g transform="translate(28,20)">
          ${[-3,0,3].map(x=>`<rect x="${x-2}" y="-10" width="4" height="12" rx="2" fill="#b39ddb" opacity="${x===0?1:.8}"/>
          <rect x="${x-1.5}" y="-6" width="3" height="8" rx="1.5" fill="#9575cd" opacity=".7"/>`).join('')}
        </g>
      </svg>`
    ]
  },

  /* 8. 鬱金香 Tulip ─ 大數數 */
  {
    id: 'tulip', name: '大數數', chineseName: '鬱金香', icon: '🌷',
    difficulty: 2, color: '#ff7043',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="30" rx="5" ry="4" fill="#a5d6a7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,22)}
        <ellipse cx="20" cy="36" rx="9" ry="4" fill="#66bb6a" transform="rotate(-20,20,36)"/>
        <ellipse cx="36" cy="36" rx="9" ry="4" fill="#66bb6a" transform="rotate(20,36,36)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="20" cy="36" rx="9" ry="4" fill="#66bb6a" transform="rotate(-20,20,36)"/>
        <ellipse cx="36" cy="36" rx="9" ry="4" fill="#66bb6a" transform="rotate(20,36,36)"/>
        <path d="M20 20 Q20 8 28 8 Q36 8 36 20 Q32 24 28 24 Q24 24 20 20Z" fill="#ff7043"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,22)}
        <ellipse cx="20" cy="37" rx="9" ry="4" fill="#66bb6a" transform="rotate(-20,20,37)"/>
        <ellipse cx="36" cy="37" rx="9" ry="4" fill="#66bb6a" transform="rotate(20,36,37)"/>
        <path d="M21 22 Q19 10 28 8 Q37 10 35 22 Q32 28 28 28 Q24 28 21 22Z" fill="#ff7043"/>
        <path d="M24 22 Q23 12 28 10 Q33 12 32 22 Q30 26 28 26 Q26 26 24 22Z" fill="#ffa726"/>
        <path d="M27 20 Q26 14 28 12 Q30 14 29 20Z" fill="#fff9c4" opacity=".6"/>
      </svg>`
    ]
  },

  /* 9. 百合 Lily ─ 進階加法 */
  {
    id: 'lily', name: '進階加法', chineseName: '百合', icon: '🤍',
    difficulty: 3, color: '#fff9c4',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,34)}
        <ellipse cx="28" cy="30" rx="5" ry="4" fill="#c8e6c9"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="18" cy="34" rx="11" ry="4" fill="#4caf50" transform="rotate(-15,18,34)"/>
        <ellipse cx="38" cy="30" rx="11" ry="4" fill="#4caf50" transform="rotate(15,38,30)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="18" cy="35" rx="11" ry="4" fill="#4caf50" transform="rotate(-15,18,35)"/>
        <ellipse cx="38" cy="31" rx="11" ry="4" fill="#4caf50" transform="rotate(15,38,31)"/>
        <path d="M23 18 Q26 8 28 8 Q30 8 33 18 Q30 22 28 22 Q26 22 23 18Z" fill="#f5f5f5" stroke="#e0e0e0" stroke-width=".5"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24)}
        <ellipse cx="18" cy="37" rx="11" ry="4" fill="#4caf50" transform="rotate(-15,18,37)"/>
        <ellipse cx="38" cy="34" rx="11" ry="4" fill="#4caf50" transform="rotate(15,38,34)"/>
        <g transform="translate(28,18)">
          ${[0,60,120,180,240,300].map((a,i)=>`<path d="M0,0 Q${Math.round(Math.sin((a+30)*Math.PI/180)*6)},${Math.round(-Math.cos((a+30)*Math.PI/180)*6)} ${Math.round(Math.sin(a*Math.PI/180)*12)},${Math.round(-Math.cos(a*Math.PI/180)*12)} Q${Math.round(Math.sin((a-30)*Math.PI/180)*6)},${Math.round(-Math.cos((a-30)*Math.PI/180)*6)} 0,0Z" fill="${i%2===0?'#fff9c4':'#f5f5f5'}" stroke="#e0e0e0" stroke-width=".5"/>`).join('')}
          <circle cx="0" cy="0" r="3" fill="#fbc02d"/>
          ${[0,72,144,216,288].map(a=>`<line x1="0" y1="0" x2="${Math.round(Math.sin(a*Math.PI/180)*5)}" y2="${Math.round(-Math.cos(a*Math.PI/180)*5)}" stroke="#f9a825" stroke-width=".8"/>`).join('')}
        </g>
      </svg>`
    ]
  },

  /* 10. 繡球花 Hydrangea ─ 進階減法 */
  {
    id: 'hydrangea', name: '進階減法', chineseName: '繡球花', icon: '💙',
    difficulty: 3, color: '#80cbc4',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,34)}
        <ellipse cx="28" cy="30" rx="5" ry="4" fill="#a5d6a7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="17" cy="33" rx="11" ry="4" fill="#388e3c" transform="rotate(-20,17,33)"/>
        <ellipse cx="39" cy="33" rx="11" ry="4" fill="#388e3c" transform="rotate(20,39,33)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="17" cy="35" rx="11" ry="4" fill="#388e3c" transform="rotate(-20,17,35)"/>
        <ellipse cx="39" cy="35" rx="11" ry="4" fill="#388e3c" transform="rotate(20,39,35)"/>
        <circle cx="28" cy="14" r="10" fill="#80cbc4" opacity=".6"/>
        <circle cx="28" cy="14" r="7" fill="#4db6ac" opacity=".5"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,26)}
        <ellipse cx="17" cy="38" rx="11" ry="4" fill="#388e3c" transform="rotate(-20,17,38)"/>
        <ellipse cx="39" cy="38" rx="11" ry="4" fill="#388e3c" transform="rotate(20,39,38)"/>
        <g transform="translate(28,18)">
          ${[[-5,-7],[3,-8],[9,-2],[8,6],[1,10],[-6,8],[-10,1],[-9,-5]].map(([cx,cy])=>`
            <g transform="translate(${cx},${cy})">
              ${[0,90,180,270].map(a=>`<ellipse cx="${Math.round(Math.sin(a*Math.PI/180)*3.5)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*3.5)}" rx="2.5" ry="1.5" fill="#80cbc4" transform="rotate(${a})"/>`).join('')}
              <circle cx="0" cy="0" r="1.5" fill="#fff"/>
            </g>`).join('')}
        </g>
      </svg>`
    ]
  },

  /* 11. 康乃馨 Carnation ─ 錢幣 */
  {
    id: 'carnation', name: '錢幣', chineseName: '康乃馨', icon: '🌸',
    difficulty: 2, color: '#f48fb1',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="5" ry="4" fill="#c8e6c9"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <path d="M22 36 Q16 30 20 24 Q24 22 28 26" stroke="#388e3c" stroke-width="2" fill="none"/>
        <path d="M34 36 Q40 30 36 24 Q32 22 28 26" stroke="#388e3c" stroke-width="2" fill="none"/>
        <ellipse cx="22" cy="32" rx="6" ry="3" fill="#66bb6a" transform="rotate(-30,22,32)"/>
        <ellipse cx="34" cy="32" rx="6" ry="3" fill="#66bb6a" transform="rotate(30,34,32)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="22" cy="34" rx="6" ry="3" fill="#66bb6a" transform="rotate(-30,22,34)"/>
        <ellipse cx="34" cy="34" rx="6" ry="3" fill="#66bb6a" transform="rotate(30,34,34)"/>
        <path d="M22 14 Q22 8 28 6 Q34 8 34 14 Q34 20 28 20 Q22 20 22 14Z" fill="#f48fb1" opacity=".8"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,26)}
        <ellipse cx="22" cy="37" rx="6" ry="3" fill="#66bb6a" transform="rotate(-30,22,37)"/>
        <ellipse cx="34" cy="37" rx="6" ry="3" fill="#66bb6a" transform="rotate(30,34,37)"/>
        <g transform="translate(28,18)">
          ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>`<path d="M0,-10 Q${Math.round(Math.sin((a+15)*Math.PI/180)*4)},${Math.round(-Math.cos((a+15)*Math.PI/180)*4)} ${Math.round(Math.sin(a*Math.PI/180)*8)},${Math.round(-Math.cos(a*Math.PI/180)*8)} Q${Math.round(Math.sin((a-15)*Math.PI/180)*4)},${Math.round(-Math.cos((a-15)*Math.PI/180)*4)} 0,-10Z" fill="${a%60===0?'#f48fb1':'#f06292'}" transform="rotate(${a})" opacity=".85"/>`).join('')}
          <circle cx="0" cy="0" r="4" fill="#fce4ec"/>
          <circle cx="0" cy="0" r="2" fill="#e91e63"/>
        </g>
      </svg>`
    ]
  },

  /* 12. 牡丹 Peony ─ 二位數加減 */
  {
    id: 'peony', name: '二位數加減', chineseName: '牡丹', icon: '🪷',
    difficulty: 3, color: '#ce93d8',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="5" ry="4" fill="#c8e6c9"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="17" cy="34" rx="12" ry="5" fill="#388e3c" transform="rotate(-20,17,34)"/>
        <ellipse cx="39" cy="34" rx="12" ry="5" fill="#388e3c" transform="rotate(20,39,34)"/>
        <ellipse cx="28" cy="24" rx="8" ry="4" fill="#4caf50"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="17" cy="36" rx="12" ry="5" fill="#388e3c" transform="rotate(-20,17,36)"/>
        <ellipse cx="39" cy="36" rx="12" ry="5" fill="#388e3c" transform="rotate(20,39,36)"/>
        <ellipse cx="28" cy="25" rx="8" ry="4" fill="#4caf50"/>
        <circle cx="28" cy="14" r="9" fill="#ce93d8" opacity=".8"/>
        <circle cx="28" cy="14" r="6" fill="#ba68c8" opacity=".7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,26)}
        <ellipse cx="17" cy="38" rx="12" ry="5" fill="#388e3c" transform="rotate(-20,17,38)"/>
        <ellipse cx="39" cy="38" rx="12" ry="5" fill="#388e3c" transform="rotate(20,39,38)"/>
        <ellipse cx="28" cy="30" rx="8" ry="4" fill="#4caf50"/>
        <g transform="translate(28,18)">
          <circle cx="0" cy="0" r="12" fill="#ce93d8" opacity=".3"/>
          ${[0,45,90,135,180,225,270,315].map(a=>`<path d="M0,-11 Q${Math.round(Math.sin((a+22)*Math.PI/180)*8)},${Math.round(-Math.cos((a+22)*Math.PI/180)*8)} ${Math.round(Math.sin(a*Math.PI/180)*10)},${Math.round(-Math.cos(a*Math.PI/180)*10)} Q${Math.round(Math.sin((a-22)*Math.PI/180)*8)},${Math.round(-Math.cos((a-22)*Math.PI/180)*8)} 0,-11Z" fill="#ce93d8" transform="rotate(${a})"/>`).join('')}
          ${[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map(a=>`<path d="M0,-7 Q${Math.round(Math.sin((a+15)*Math.PI/180)*5)},${Math.round(-Math.cos((a+15)*Math.PI/180)*5)} ${Math.round(Math.sin(a*Math.PI/180)*7)},${Math.round(-Math.cos(a*Math.PI/180)*7)} Q${Math.round(Math.sin((a-15)*Math.PI/180)*5)},${Math.round(-Math.cos((a-15)*Math.PI/180)*5)} 0,-7Z" fill="#ab47bc" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="4" fill="#fce4ec"/>
          <circle cx="0" cy="0" r="2" fill="#e91e63" opacity=".6"/>
        </g>
      </svg>`
    ]
  },
  /* 13. 水仙 Narcissus ─ 加減混合 */
  {
    id: 'narcissus', name: '加減混合', chineseName: '水仙', icon: '🌼',
    difficulty: 3, color: '#fffde7',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,36)}<ellipse cx="28" cy="32" rx="5" ry="4" class="fl-sprout"/></svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="20" cy="38" rx="3" ry="11" fill="#66bb6a" transform="rotate(-12,20,38)"/>
        <ellipse cx="36" cy="36" rx="3" ry="11" fill="#66bb6a" transform="rotate(12,36,36)"/></svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="20" cy="36" rx="3" ry="11" fill="#66bb6a" transform="rotate(-12,20,36)"/>
        <ellipse cx="36" cy="34" rx="3" ry="11" fill="#66bb6a" transform="rotate(12,36,34)"/>
        <ellipse cx="28" cy="12" rx="5" ry="8" fill="#fffde7"/>
        <ellipse cx="28" cy="14" rx="3" ry="5" fill="#ffd54f" opacity=".6"/></svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="20" cy="36" rx="3" ry="11" fill="#66bb6a" transform="rotate(-12,20,36)"/>
        <ellipse cx="36" cy="34" rx="3" ry="11" fill="#66bb6a" transform="rotate(12,36,34)"/>
        <ellipse cx="28" cy="4" rx="4" ry="8" fill="#fffde7"/>
        <ellipse cx="37" cy="8" rx="4" ry="8" fill="#fffde7" transform="rotate(60,37,8)"/>
        <ellipse cx="37" cy="18" rx="4" ry="8" fill="#fffde7" transform="rotate(120,37,18)"/>
        <ellipse cx="28" cy="22" rx="4" ry="8" fill="#fffde7" transform="rotate(180,28,22)"/>
        <ellipse cx="19" cy="18" rx="4" ry="8" fill="#fffde7" transform="rotate(240,19,18)"/>
        <ellipse cx="19" cy="8" rx="4" ry="8" fill="#fffde7" transform="rotate(300,19,8)"/>
        <circle cx="28" cy="13" r="6" fill="#ffd54f"/>
        <circle cx="28" cy="13" r="3" fill="#ff8f00"/></svg>`
    ]
  },

  /* 14. 荷花 Lotus ─ 綜合應用 */
  {
    id: 'lotus', name: '綜合應用', chineseName: '荷花', icon: '🪷',
    difficulty: 3, color: '#fce4ec',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,36)}<ellipse cx="28" cy="31" rx="6" ry="5" fill="#f8bbd9"/></svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="16" cy="34" rx="10" ry="6" fill="#a5d6a7" transform="rotate(-20,16,34)"/>
        ${leafPair(28,32,1)}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="16" cy="32" rx="10" ry="6" fill="#a5d6a7" transform="rotate(-20,16,32)"/>
        ${leafPair(28,30,1)}
        <ellipse cx="28" cy="13" rx="6" ry="10" fill="#f48fb1"/>
        <ellipse cx="28" cy="11" rx="4" ry="7" fill="#f8bbd9"/></svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="15" cy="32" rx="11" ry="6" fill="#a5d6a7" transform="rotate(-20,15,32)"/>
        ${leafPair(28,30,1)}
        <ellipse cx="28" cy="3" rx="5" ry="9" fill="#f8bbd9"/>
        <ellipse cx="38" cy="10" rx="5" ry="9" fill="#f8bbd9" transform="rotate(72,38,10)"/>
        <ellipse cx="34" cy="21" rx="5" ry="9" fill="#f8bbd9" transform="rotate(144,34,21)"/>
        <ellipse cx="22" cy="21" rx="5" ry="9" fill="#f8bbd9" transform="rotate(216,22,21)"/>
        <ellipse cx="18" cy="10" rx="5" ry="9" fill="#f8bbd9" transform="rotate(288,18,10)"/>
        <ellipse cx="28" cy="6" rx="3.5" ry="7" fill="#f48fb1"/>
        <ellipse cx="35" cy="11" rx="3.5" ry="7" fill="#f48fb1" transform="rotate(72,35,11)"/>
        <ellipse cx="32" cy="19" rx="3.5" ry="7" fill="#f48fb1" transform="rotate(144,32,19)"/>
        <ellipse cx="24" cy="19" rx="3.5" ry="7" fill="#f48fb1" transform="rotate(216,24,19)"/>
        <ellipse cx="21" cy="11" rx="3.5" ry="7" fill="#f48fb1" transform="rotate(288,21,11)"/>
        <circle cx="28" cy="13" r="5" fill="#fff9c4"/>
        <circle cx="28" cy="13" r="3" fill="#fdd835"/></svg>`
    ]
  },

  /* 15. 茉莉 Jasmine ─ 基礎情境題 */
  {
    id: 'jasmine', name: '基礎情境題', chineseName: '茉莉', icon: '🤍',
    difficulty: 4, color: '#f0fff4',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,34)}<ellipse cx="28" cy="30" rx="6" ry="5" class="fl-sprout"/></svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        ${leafPair(28,38,1)}${leafPair(28,28,-1)}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,16)}
        ${leafPair(28,36,1)}${leafPair(28,26,-1)}
        <circle cx="28" cy="11" r="7" fill="#e8f5e9"/>
        <ellipse cx="28" cy="11" rx="5" ry="7" fill="#f1f8e9"/></svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        ${leafPair(28,36,1)}${leafPair(28,28,-1)}
        <ellipse cx="28" cy="3" rx="4" ry="7" fill="#f0f4f8"/>
        <ellipse cx="36" cy="9" rx="4" ry="7" fill="#f0f4f8" transform="rotate(72,36,9)"/>
        <ellipse cx="34" cy="20" rx="4" ry="7" fill="#f0f4f8" transform="rotate(144,34,20)"/>
        <ellipse cx="22" cy="20" rx="4" ry="7" fill="#f0f4f8" transform="rotate(216,22,20)"/>
        <ellipse cx="20" cy="9" rx="4" ry="7" fill="#f0f4f8" transform="rotate(288,20,9)"/>
        <circle cx="28" cy="13" r="4" fill="#fdd835"/>
        <circle cx="28" cy="13" r="2" fill="#f57f17"/>
        <ellipse cx="12" cy="22" rx="3" ry="5" fill="#f0f4f8"/>
        <ellipse cx="9" cy="22" rx="2" ry="4" fill="#f0f4f8" transform="rotate(-30,9,22)"/>
        <ellipse cx="15" cy="22" rx="2" ry="4" fill="#f0f4f8" transform="rotate(30,15,22)"/>
        <circle cx="12" cy="22" r="2" fill="#fdd835"/></svg>`
    ]
  },

  /* 16. 紫羅蘭 Violet ─ 進階情境題 */
  {
    id: 'violet', name: '進階情境題', chineseName: '紫羅蘭', icon: '💜',
    difficulty: 5, color: '#ede7f6',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,36)}<ellipse cx="28" cy="32" rx="5" ry="4" fill="#ce93d8"/></svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="18" cy="34" rx="9" ry="7" fill="#a5d6a7" transform="rotate(-20,18,34)"/>
        <ellipse cx="38" cy="32" rx="9" ry="7" fill="#a5d6a7" transform="rotate(20,38,32)"/></svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,16)}
        <ellipse cx="18" cy="32" rx="9" ry="7" fill="#a5d6a7" transform="rotate(-20,18,32)"/>
        <ellipse cx="38" cy="30" rx="9" ry="7" fill="#a5d6a7" transform="rotate(20,38,30)"/>
        <ellipse cx="28" cy="12" rx="5" ry="9" fill="#ce93d8"/>
        <ellipse cx="28" cy="10" rx="3" ry="6" fill="#ede7f6"/></svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="18" cy="32" rx="9" ry="7" fill="#a5d6a7" transform="rotate(-20,18,32)"/>
        <ellipse cx="38" cy="30" rx="9" ry="7" fill="#a5d6a7" transform="rotate(20,38,30)"/>
        <ellipse cx="28" cy="3" rx="5" ry="9" fill="#ce93d8"/>
        <ellipse cx="38" cy="10" rx="5" ry="9" fill="#ce93d8" transform="rotate(72,38,10)"/>
        <ellipse cx="34" cy="21" rx="5" ry="9" fill="#ab47bc" transform="rotate(144,34,21)"/>
        <ellipse cx="22" cy="21" rx="5" ry="9" fill="#ab47bc" transform="rotate(216,22,21)"/>
        <ellipse cx="18" cy="10" rx="5" ry="9" fill="#ce93d8" transform="rotate(288,18,10)"/>
        <circle cx="28" cy="13" r="5" fill="#fffde7"/>
        <circle cx="28" cy="13" r="2" fill="#fdd835"/></svg>`
    ]
  }
];

/* ------------------------------------------------------------------ */
/*  Grade 2: 16 Flower Definitions (全新設計)                           */
/* ------------------------------------------------------------------ */
const FLOWERS_G2 = [

  /* 1. 木芙蓉 Hibiscus mutabilis ─ 200以內的數 */
  {
    id: 'hibiscus', name: '200以內的數', chineseName: '木芙蓉', icon: '🌺',
    difficulty: 2, color: '#f8bbd9',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,32)}
        <ellipse cx="28" cy="28" rx="7" ry="5" fill="#f8bbd9" opacity=".7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        ${leafPair(28,38,1)}${leafPair(28,30,-1)}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,16)}
        ${leafPair(28,38,1)}${leafPair(28,28,-1)}
        <circle cx="28" cy="12" r="9" fill="#f48fb1" opacity=".85"/>
        <circle cx="28" cy="12" r="5" fill="#e91e63" opacity=".6"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24)}
        ${leafPair(28,40,1)}${leafPair(28,32,-1)}
        <g transform="translate(28,18)">
          ${[0,72,144,216,288].map(a=>`<path d="M0,-11 Q${Math.round(Math.sin((a+36)*Math.PI/180)*7)},${Math.round(-Math.cos((a+36)*Math.PI/180)*7)} ${Math.round(Math.sin(a*Math.PI/180)*11)},${Math.round(-Math.cos(a*Math.PI/180)*11)} Q${Math.round(Math.sin((a-36)*Math.PI/180)*7)},${Math.round(-Math.cos((a-36)*Math.PI/180)*7)} 0,-11Z" fill="#f8bbd9" transform="rotate(${a})" opacity=".9"/>`).join('')}
          ${[36,108,180,252,324].map(a=>`<path d="M0,-8 Q${Math.round(Math.sin((a+36)*Math.PI/180)*5)},${Math.round(-Math.cos((a+36)*Math.PI/180)*5)} ${Math.round(Math.sin(a*Math.PI/180)*8)},${Math.round(-Math.cos(a*Math.PI/180)*8)} Q${Math.round(Math.sin((a-36)*Math.PI/180)*5)},${Math.round(-Math.cos((a-36)*Math.PI/180)*5)} 0,-8Z" fill="#f48fb1" transform="rotate(${a})" opacity=".8"/>`).join('')}
          <circle cx="0" cy="0" r="4" fill="#e91e63"/>
          <circle cx="0" cy="0" r="2" fill="#fce4ec"/>
        </g>
      </svg>`
    ]
  },

  /* 2. 金盞花 Marigold ─ 二位數加法（進位） */
  {
    id: 'marigold', name: '二位數加法', chineseName: '金盞花', icon: '🌼',
    difficulty: 2, color: '#ffa726',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="5" ry="4" fill="#fff9c4"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        ${leafPair(28,38,1)}${leafPair(28,30,-1)}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        ${leafPair(28,38,1)}${leafPair(28,28,-1)}
        <circle cx="28" cy="12" r="10" fill="#ffa726" opacity=".8"/>
        <circle cx="28" cy="12" r="5" fill="#ff6f00"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24)}
        ${leafPair(28,40,1)}${leafPair(28,32,-1)}
        <g transform="translate(28,17)">
          ${[0,22.5,45,67.5,90,112.5,135,157.5,180,202.5,225,247.5,270,292.5,315,337.5].map(a=>`<ellipse cx="${Math.round(Math.sin(a*Math.PI/180)*10)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*10)}" rx="4" ry="2.5" fill="#ffa726" transform="rotate(${a})" opacity=".9"/>`).join('')}
          ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>`<ellipse cx="${Math.round(Math.sin(a*Math.PI/180)*6)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*6)}" rx="3" ry="2" fill="#ffb74d" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="4" fill="#e65100"/>
          <circle cx="0" cy="0" r="2" fill="#ff8f00"/>
        </g>
      </svg>`
    ]
  },

  /* 3. 桔梗 Bellflower ─ 二位數減法（退位） */
  {
    id: 'bellflower', name: '二位數減法', chineseName: '桔梗', icon: '💜',
    difficulty: 2, color: '#7e57c2',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="5" ry="4" fill="#ce93d8" opacity=".7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        ${leafPair(28,38,-1)}${leafPair(28,30,1)}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        ${leafPair(28,38,-1)}${leafPair(28,28,1)}
        <path d="M19 14 Q19 4 28 4 Q37 4 37 14 Q37 22 28 22 Q19 22 19 14Z" fill="#7e57c2" opacity=".85"/>
        <path d="M22 14 Q22 7 28 7 Q34 7 34 14 Q34 20 28 20 Q22 20 22 14Z" fill="#b39ddb"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24)}
        ${leafPair(28,40,-1)}${leafPair(28,32,1)}
        <g transform="translate(28,16)">
          ${[0,72,144,216,288].map(a=>`<path d="M0,-10 Q${Math.round(Math.sin((a+36)*Math.PI/180)*8)},${Math.round(-Math.cos((a+36)*Math.PI/180)*8)} ${Math.round(Math.sin(a*Math.PI/180)*10)},${Math.round(-Math.cos(a*Math.PI/180)*10)} Q${Math.round(Math.sin((a-36)*Math.PI/180)*8)},${Math.round(-Math.cos((a-36)*Math.PI/180)*8)} 0,-10Z" fill="#7e57c2" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="5" fill="#ede7f6"/>
          <circle cx="0" cy="0" r="3" fill="#7e57c2"/>
          ${[0,72,144,216,288].map(a=>`<line x1="0" y1="0" x2="${Math.round(Math.sin(a*Math.PI/180)*4)}" y2="${Math.round(-Math.cos(a*Math.PI/180)*4)}" stroke="#9575cd" stroke-width="1"/>`).join('')}
        </g>
      </svg>`
    ]
  },

  /* 4. 波斯菊 Cosmos ─ 長度（公分） */
  {
    id: 'cosmos', name: '長度（公分）', chineseName: '波斯菊', icon: '🌸',
    difficulty: 2, color: '#f48fb1',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,34,'fl-stem-thin')}
        <ellipse cx="28" cy="30" rx="4" ry="3" fill="#f8bbd9"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20,'fl-stem-thin')}
        <ellipse cx="18" cy="36" rx="8" ry="3" fill="#66bb6a" transform="rotate(-25,18,36)"/>
        <ellipse cx="38" cy="33" rx="8" ry="3" fill="#66bb6a" transform="rotate(25,38,33)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18,'fl-stem-thin')}
        <ellipse cx="18" cy="36" rx="8" ry="3" fill="#66bb6a" transform="rotate(-25,18,36)"/>
        <ellipse cx="38" cy="33" rx="8" ry="3" fill="#66bb6a" transform="rotate(25,38,33)"/>
        <circle cx="28" cy="12" r="9" fill="#f48fb1" opacity=".7"/>
        <circle cx="28" cy="12" r="4" fill="#fce4ec"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,22,'fl-stem-thin')}
        <ellipse cx="18" cy="38" rx="8" ry="3" fill="#66bb6a" transform="rotate(-25,18,38)"/>
        <ellipse cx="38" cy="36" rx="8" ry="3" fill="#66bb6a" transform="rotate(25,38,36)"/>
        <g transform="translate(28,16)">
          ${[0,45,90,135,180,225,270,315].map(a=>`<ellipse cx="${Math.round(Math.sin(a*Math.PI/180)*10)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*10)}" rx="3.5" ry="8" fill="#f48fb1" transform="rotate(${a})" opacity=".9"/>`).join('')}
          <circle cx="0" cy="0" r="4" fill="#ffd54f"/>
          <circle cx="0" cy="0" r="2" fill="#ff8f00"/>
        </g>
      </svg>`
    ]
  },

  /* 5. 風信子 Hyacinth ─ 容量 */
  {
    id: 'hyacinth', name: '容量', chineseName: '風信子', icon: '💙',
    difficulty: 2, color: '#1e88e5',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,34)}
        <ellipse cx="28" cy="30" rx="4" ry="5" fill="#64b5f6" opacity=".6"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="20" cy="38" rx="3" ry="10" fill="#388e3c" transform="rotate(-10,20,38)"/>
        <ellipse cx="36" cy="36" rx="3" ry="10" fill="#388e3c" transform="rotate(10,36,36)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,16)}
        <ellipse cx="20" cy="36" rx="3" ry="10" fill="#388e3c" transform="rotate(-10,20,36)"/>
        <ellipse cx="36" cy="34" rx="3" ry="10" fill="#388e3c" transform="rotate(10,36,34)"/>
        <rect x="23" y="6" width="10" height="14" rx="5" fill="#1e88e5" opacity=".7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="20" cy="36" rx="3" ry="10" fill="#388e3c" transform="rotate(-10,20,36)"/>
        <ellipse cx="36" cy="34" rx="3" ry="10" fill="#388e3c" transform="rotate(10,36,34)"/>
        <g transform="translate(28,18)">
          ${[-4,-2,0,2,4].map((x,i)=>[...Array(5-Math.abs(x))].map((_,j)=>`<ellipse cx="${x*3}" cy="${-j*4 + (2-Math.abs(x))*2}" rx="3.5" ry="2.5" fill="${['#1565c0','#1976d2','#1e88e5','#2196f3','#42a5f5'][j]}" opacity=".9"/>`).join('')).join('')}
        </g>
      </svg>`
    ]
  },

  /* 6. 梔子花 Gardenia ─ 時間（時分） */
  {
    id: 'gardenia', name: '時間（時分）', chineseName: '梔子花', icon: '🤍',
    difficulty: 2, color: '#f5f5f5',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="6" ry="4" fill="#e8f5e9"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        ${leafPair(28,38,1)}${leafPair(28,30,-1)}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        ${leafPair(28,38,1)}${leafPair(28,28,-1)}
        <circle cx="28" cy="12" r="9" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="1"/>
        <circle cx="28" cy="12" r="6" fill="#eeeeee"/>
        <circle cx="28" cy="12" r="2" fill="#bdbdbd"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24)}
        ${leafPair(28,40,1)}${leafPair(28,32,-1)}
        <g transform="translate(28,17)">
          ${[0,45,90,135,180,225,270,315].map((a,i)=>`<path d="M0,-10 Q${Math.round(Math.sin((a+22)*Math.PI/180)*7)},${Math.round(-Math.cos((a+22)*Math.PI/180)*7)} ${Math.round(Math.sin(a*Math.PI/180)*10)},${Math.round(-Math.cos(a*Math.PI/180)*10)} Q${Math.round(Math.sin((a-22)*Math.PI/180)*7)},${Math.round(-Math.cos((a-22)*Math.PI/180)*7)} 0,-10Z" fill="${i%2===0?'#fff':'#f5f5f5'}" stroke="#e0e0e0" stroke-width=".5" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="5" fill="#fff9c4"/>
          <circle cx="0" cy="0" r="2" fill="#fdd835"/>
        </g>
      </svg>`
    ]
  },

  /* 7. 小太陽 Mini Sunflower ─ 乘法（2、4、5） */
  {
    id: 'small-sunflower', name: '乘法（2、4、5）', chineseName: '小太陽菊', icon: '🌻',
    difficulty: 3, color: '#ffca28',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="5" ry="4" fill="#fff9c4"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        ${leafPair(28,38,1)}${leafPair(28,30,-1)}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        ${leafPair(28,38,1)}${leafPair(28,30,-1)}
        <circle cx="28" cy="12" r="9" fill="#ffca28"/>
        <circle cx="28" cy="12" r="5" fill="#6d4c41"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24)}
        ${leafPair(28,40,1)}${leafPair(28,34,-1)}
        <g transform="translate(28,17)">
          ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>`<ellipse cx="${Math.round(Math.sin(a*Math.PI/180)*10)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*10)}" rx="4" ry="2.5" fill="#ffca28" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="6" fill="#4e342e"/>
          <circle cx="0" cy="0" r="4" fill="#6d4c41"/>
          ${[0,60,120,180,240,300].map(a=>`<circle cx="${Math.round(Math.sin(a*Math.PI/180)*2)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*2)}" r="0.8" fill="#3e2723"/>`).join('')}
        </g>
      </svg>`
    ]
  },

  /* 8. 夾竹桃 Oleander ─ 乘法（3、6、7） */
  {
    id: 'oleander', name: '乘法（3、6、7）', chineseName: '夾竹桃', icon: '🌸',
    difficulty: 3, color: '#e91e63',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="5" ry="4" fill="#f8bbd9" opacity=".7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="16" cy="34" rx="11" ry="4" fill="#388e3c" transform="rotate(-15,16,34)"/>
        <ellipse cx="38" cy="30" rx="11" ry="4" fill="#388e3c" transform="rotate(15,38,30)"/>
        <ellipse cx="28" cy="24" rx="7" ry="3" fill="#4caf50"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,16)}
        <ellipse cx="16" cy="34" rx="11" ry="4" fill="#388e3c" transform="rotate(-15,16,34)"/>
        <ellipse cx="38" cy="30" rx="11" ry="4" fill="#388e3c" transform="rotate(15,38,30)"/>
        <path d="M20 12 Q22 4 28 4 Q34 4 36 12 Q32 18 28 18 Q24 18 20 12Z" fill="#e91e63" opacity=".85"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,22)}
        <ellipse cx="16" cy="36" rx="11" ry="4" fill="#388e3c" transform="rotate(-15,16,36)"/>
        <ellipse cx="38" cy="32" rx="11" ry="4" fill="#388e3c" transform="rotate(15,38,32)"/>
        <g transform="translate(28,16)">
          ${[0,72,144,216,288].map(a=>`<path d="M0,-10 Q${Math.round(Math.sin((a+36)*Math.PI/180)*6)},${Math.round(-Math.cos((a+36)*Math.PI/180)*6)} ${Math.round(Math.sin(a*Math.PI/180)*9)},${Math.round(-Math.cos(a*Math.PI/180)*9)} Q${Math.round(Math.sin((a-36)*Math.PI/180)*6)},${Math.round(-Math.cos((a-36)*Math.PI/180)*6)} 0,-10Z" fill="#e91e63" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="4" fill="#fff"/>
          <circle cx="0" cy="0" r="2" fill="#e91e63"/>
          ${[0,72,144,216,288].map(a=>`<line x1="0" y1="0" x2="${Math.round(Math.sin(a*Math.PI/180)*3)}" y2="${Math.round(-Math.cos(a*Math.PI/180)*3)}" stroke="#f48fb1" stroke-width="1"/>`).join('')}
        </g>
      </svg>`
    ]
  },

  /* 9. 蓮花 Lotus ─ 面積大小比較 */
  {
    id: 'water-lily', name: '面積大小比較', chineseName: '蓮花', icon: '🪷',
    difficulty: 2, color: '#e1bee7',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,36,'fl-stem-thin')}
        <ellipse cx="28" cy="32" rx="6" ry="4" fill="#80cbc4" opacity=".6"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,28,'fl-stem-thin')}
        <ellipse cx="28" cy="44" rx="18" ry="6" fill="#388e3c" opacity=".7"/>
        <ellipse cx="14" cy="42" rx="10" ry="5" fill="#2e7d32" opacity=".8" transform="rotate(-15,14,42)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24,'fl-stem-thin')}
        <ellipse cx="28" cy="46" rx="20" ry="6" fill="#388e3c" opacity=".7"/>
        <ellipse cx="12" cy="44" rx="10" ry="5" fill="#2e7d32" opacity=".8" transform="rotate(-20,12,44)"/>
        <path d="M22 22 Q22 12 28 10 Q34 12 34 22 Q31 28 28 28 Q25 28 22 22Z" fill="#e1bee7"/>
        <path d="M24 22 Q24 14 28 12 Q32 14 32 22 Q30 26 28 26 Q26 26 24 22Z" fill="#f3e5f5"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,26,'fl-stem-thin')}
        <ellipse cx="28" cy="46" rx="22" ry="7" fill="#388e3c" opacity=".7"/>
        <ellipse cx="10" cy="44" rx="10" ry="5" fill="#2e7d32" opacity=".8" transform="rotate(-20,10,44)"/>
        <g transform="translate(28,18)">
          ${[0,72,144,216,288].map(a=>`<path d="M0,-12 Q${Math.round(Math.sin((a+36)*Math.PI/180)*5)},${Math.round(-Math.cos((a+36)*Math.PI/180)*5)} ${Math.round(Math.sin(a*Math.PI/180)*10)},${Math.round(-Math.cos(a*Math.PI/180)*10)} Q${Math.round(Math.sin((a-36)*Math.PI/180)*5)},${Math.round(-Math.cos((a-36)*Math.PI/180)*5)} 0,-12Z" fill="#e1bee7" transform="rotate(${a})"/>`).join('')}
          ${[36,108,180,252,324].map(a=>`<path d="M0,-8 Q${Math.round(Math.sin((a+36)*Math.PI/180)*4)},${Math.round(-Math.cos((a+36)*Math.PI/180)*4)} ${Math.round(Math.sin(a*Math.PI/180)*7)},${Math.round(-Math.cos(a*Math.PI/180)*7)} Q${Math.round(Math.sin((a-36)*Math.PI/180)*4)},${Math.round(-Math.cos((a-36)*Math.PI/180)*4)} 0,-8Z" fill="#ce93d8" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="4" fill="#fff9c4"/>
          <circle cx="0" cy="0" r="2" fill="#fdd835"/>
        </g>
      </svg>`
    ]
  },

  /* 10. 山茶花 Camellia ─ 1000以內的數 */
  {
    id: 'camellia', name: '1000以內的數', chineseName: '山茶花', icon: '🌹',
    difficulty: 3, color: '#c62828',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="5" ry="4" fill="#ef9a9a" opacity=".7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <path d="M22 36 Q16 30 20 24 Q24 20 28 24" stroke="#388e3c" stroke-width="2.5" fill="none"/>
        <path d="M34 36 Q40 30 36 24 Q32 20 28 24" stroke="#388e3c" stroke-width="2.5" fill="none"/>
        <ellipse cx="20" cy="32" rx="7" ry="3" fill="#4caf50" transform="rotate(-30,20,32)"/>
        <ellipse cx="36" cy="32" rx="7" ry="3" fill="#4caf50" transform="rotate(30,36,32)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="18" cy="34" rx="10" ry="4" fill="#388e3c" transform="rotate(-20,18,34)"/>
        <ellipse cx="38" cy="34" rx="10" ry="4" fill="#388e3c" transform="rotate(20,38,34)"/>
        <circle cx="28" cy="13" r="10" fill="#c62828" opacity=".8"/>
        <circle cx="28" cy="13" r="6" fill="#b71c1c"/>
        <circle cx="28" cy="13" r="3" fill="#fce4ec" opacity=".6"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24)}
        <ellipse cx="18" cy="36" rx="10" ry="4" fill="#388e3c" transform="rotate(-20,18,36)"/>
        <ellipse cx="38" cy="36" rx="10" ry="4" fill="#388e3c" transform="rotate(20,38,36)"/>
        <g transform="translate(28,17)">
          <circle cx="0" cy="0" r="12" fill="#c62828" opacity=".25"/>
          ${[0,45,90,135,180,225,270,315].map(a=>`<path d="M0,-11 Q${Math.round(Math.sin((a+22)*Math.PI/180)*8)},${Math.round(-Math.cos((a+22)*Math.PI/180)*8)} ${Math.round(Math.sin(a*Math.PI/180)*10)},${Math.round(-Math.cos(a*Math.PI/180)*10)} Q${Math.round(Math.sin((a-22)*Math.PI/180)*8)},${Math.round(-Math.cos((a-22)*Math.PI/180)*8)} 0,-11Z" fill="#c62828" transform="rotate(${a})"/>`).join('')}
          ${[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map(a=>`<path d="M0,-7 Q${Math.round(Math.sin((a+15)*Math.PI/180)*5)},${Math.round(-Math.cos((a+15)*Math.PI/180)*5)} ${Math.round(Math.sin(a*Math.PI/180)*7)},${Math.round(-Math.cos(a*Math.PI/180)*7)} Q${Math.round(Math.sin((a-15)*Math.PI/180)*5)},${Math.round(-Math.cos((a-15)*Math.PI/180)*5)} 0,-7Z" fill="#e53935" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="4" fill="#fff9c4"/>
          ${[0,72,144,216,288].map(a=>`<line x1="0" y1="0" x2="${Math.round(Math.sin(a*Math.PI/180)*3)}" y2="${Math.round(-Math.cos(a*Math.PI/180)*3)}" stroke="#fdd835" stroke-width="1"/>`).join('')}
        </g>
      </svg>`
    ]
  },

  /* 11. 紫藤 Wisteria ─ 三位數加減法 */
  {
    id: 'wisteria', name: '三位數加減法', chineseName: '紫藤', icon: '💜',
    difficulty: 3, color: '#9c27b0',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        <line x1="28" y1="48" x2="28" y2="10" stroke="#52b788" stroke-width="2.5"/>
        <line x1="28" y1="14" x2="14" y2="14" stroke="#52b788" stroke-width="2"/>
        <ellipse cx="14" cy="18" rx="4" ry="6" fill="#ce93d8" opacity=".6"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        <line x1="28" y1="48" x2="28" y2="8" stroke="#52b788" stroke-width="2.5"/>
        <line x1="28" y1="12" x2="10" y2="12" stroke="#52b788" stroke-width="2"/>
        <line x1="28" y1="18" x2="10" y2="18" stroke="#52b788" stroke-width="1.5"/>
        <ellipse cx="10" cy="16" rx="3" ry="8" fill="#81c784" transform="rotate(-5,10,16)"/>
        <ellipse cx="28" cy="32" rx="14" ry="4" fill="#81c784" opacity=".5"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        <line x1="28" y1="48" x2="28" y2="6" stroke="#52b788" stroke-width="2.5"/>
        <line x1="28" y1="10" x2="8" y2="10" stroke="#52b788" stroke-width="2"/>
        <line x1="28" y1="16" x2="8" y2="16" stroke="#52b788" stroke-width="1.5"/>
        <ellipse cx="8" cy="14" rx="3" ry="9" fill="#81c784" transform="rotate(-5,8,14)"/>
        ${[0,4,8,12,16,20,24].map(y=>`<ellipse cx="${12+Math.round(Math.sin(y)*3)}" cy="${y+4}" rx="4" ry="3" fill="${y<8?'#9c27b0':y<16?'#7b1fa2':'#6a1b9a'}" opacity=".85"/>`).join('')}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        <line x1="28" y1="48" x2="28" y2="4" stroke="#52b788" stroke-width="2.5"/>
        <line x1="28" y1="8" x2="6" y2="8" stroke="#52b788" stroke-width="2"/>
        <line x1="28" y1="14" x2="6" y2="14" stroke="#52b788" stroke-width="1.5"/>
        <line x1="28" y1="20" x2="10" y2="20" stroke="#52b788" stroke-width="1.5"/>
        <ellipse cx="6" cy="12" rx="3" ry="10" fill="#81c784" transform="rotate(-5,6,12)"/>
        ${[0,4,8,12,16,20,24,28].map((y,i)=>`<ellipse cx="${10+Math.round(Math.sin(i*0.8)*4)}" cy="${y+2}" rx="4.5" ry="3.5" fill="${['#ab47bc','#9c27b0','#8e24aa','#7b1fa2','#6a1b9a','#4a148c','#9c27b0','#ab47bc'][i]}" opacity=".9"/>`).join('')}
        ${[0,5,10,15,20,25].map((y,i)=>`<ellipse cx="${38+Math.round(Math.sin(i)*3)}" cy="${y+8}" rx="4" ry="3" fill="${['#ce93d8','#ba68c8','#ab47bc','#9c27b0','#8e24aa','#7b1fa2'][i]}" opacity=".8"/>`).join('')}
      </svg>`
    ]
  },

  /* 12. 大向日葵 Large Sunflower ─ 公尺與公分 */
  {
    id: 'large-sunflower', name: '公尺與公分', chineseName: '大向日葵', icon: '🌻',
    difficulty: 3, color: '#f9a825',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,50,28,30)}
        <ellipse cx="28" cy="26" rx="8" ry="6" fill="#aed581" opacity=".7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,50,28,14)}
        ${leafPair(28,40,1)}${leafPair(28,30,-1)}${leafPair(28,22,1)}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,50,28,12)}
        ${leafPair(28,40,1)}${leafPair(28,30,-1)}${leafPair(28,22,1)}
        <circle cx="28" cy="10" r="9" fill="#4e342e"/>
        <circle cx="28" cy="10" r="7" fill="#6d4c41"/>
        ${[0,45,90,135,180,225,270,315].map(a=>`<ellipse cx="${Math.round(Math.sin(a*Math.PI/180)*12)}" cy="${10+Math.round(-Math.cos(a*Math.PI/180)*12)}" rx="4" ry="2.5" fill="#f9a825" transform="rotate(${a},${Math.round(Math.sin(a*Math.PI/180)*12)},${10+Math.round(-Math.cos(a*Math.PI/180)*12)})"/>`).join('')}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,50,28,14)}
        ${leafPair(28,42,1)}${leafPair(28,33,-1)}${leafPair(28,24,1)}
        <g transform="translate(28,10)">
          ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>`<ellipse cx="${Math.round(Math.sin(a*Math.PI/180)*13)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*13)}" rx="5" ry="3" fill="#f9a825" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="8" fill="#4e342e"/>
          <circle cx="0" cy="0" r="6" fill="#6d4c41"/>
          ${[0,45,90,135,180,225,270,315].map(a=>`<circle cx="${Math.round(Math.sin(a*Math.PI/180)*3)}" cy="${Math.round(-Math.cos(a*Math.PI/180)*3)}" r="1.2" fill="#3e2723"/>`).join('')}
          <circle cx="0" cy="0" r="1.5" fill="#ff8f00"/>
        </g>
      </svg>`
    ]
  },

  /* 13. 龍膽 Gentian ─ 年月日 */
  {
    id: 'gentian', name: '年月日', chineseName: '龍膽', icon: '💙',
    difficulty: 2, color: '#1565c0',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="4" ry="6" fill="#90caf9" opacity=".6"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="18" cy="34" rx="9" ry="3.5" fill="#388e3c" transform="rotate(-20,18,34)"/>
        <ellipse cx="38" cy="32" rx="9" ry="3.5" fill="#388e3c" transform="rotate(20,38,32)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="18" cy="36" rx="9" ry="3.5" fill="#388e3c" transform="rotate(-20,18,36)"/>
        <ellipse cx="38" cy="34" rx="9" ry="3.5" fill="#388e3c" transform="rotate(20,38,34)"/>
        <path d="M21 14 Q21 4 28 4 Q35 4 35 14 Q35 22 28 24 Q21 22 21 14Z" fill="#1565c0" opacity=".85"/>
        <path d="M23 14 Q23 7 28 7 Q33 7 33 14 Q33 20 28 22 Q23 20 23 14Z" fill="#42a5f5"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,22)}
        <ellipse cx="18" cy="37" rx="9" ry="3.5" fill="#388e3c" transform="rotate(-20,18,37)"/>
        <ellipse cx="38" cy="35" rx="9" ry="3.5" fill="#388e3c" transform="rotate(20,38,35)"/>
        <g transform="translate(28,18)">
          ${[[-3,0],[3,0],[0,-3]].map(([dx,dy])=>`<path d="M${dx},-10 Q${dx+6},-6 ${dx+8},${dy+2} Q${dx+4},${dy+8} ${dx},${dy+10} Q${dx-4},${dy+8} ${dx-8},${dy+2} Q${dx-6},-6 ${dx},-10Z" fill="#1565c0" opacity=".85"/>`).join('')}
          <circle cx="0" cy="0" r="5" fill="#e3f2fd"/>
          <circle cx="0" cy="0" r="3" fill="#42a5f5"/>
        </g>
      </svg>`
    ]
  },

  /* 14. 雞蛋花 Plumeria ─ 除法概念 */
  {
    id: 'plumeria', name: '除法概念', chineseName: '雞蛋花', icon: '🌼',
    difficulty: 3, color: '#fffde7',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="5" ry="4" fill="#fff9c4" opacity=".7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        <ellipse cx="18" cy="34" rx="11" ry="4" fill="#558b2f" transform="rotate(-15,18,34)"/>
        <ellipse cx="38" cy="32" rx="11" ry="4" fill="#558b2f" transform="rotate(15,38,32)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="18" cy="36" rx="11" ry="4" fill="#558b2f" transform="rotate(-15,18,36)"/>
        <ellipse cx="38" cy="34" rx="11" ry="4" fill="#558b2f" transform="rotate(15,38,34)"/>
        <circle cx="28" cy="12" r="9" fill="#fffde7" stroke="#fff176" stroke-width="1"/>
        <circle cx="28" cy="12" r="5" fill="#fdd835" opacity=".7"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,23)}
        <ellipse cx="18" cy="37" rx="11" ry="4" fill="#558b2f" transform="rotate(-15,18,37)"/>
        <ellipse cx="38" cy="35" rx="11" ry="4" fill="#558b2f" transform="rotate(15,38,35)"/>
        <g transform="translate(28,17)">
          ${[0,72,144,216,288].map(a=>`<path d="M0,-11 Q${Math.round(Math.sin((a+36)*Math.PI/180)*6)},${Math.round(-Math.cos((a+36)*Math.PI/180)*6)} ${Math.round(Math.sin(a*Math.PI/180)*9)},${Math.round(-Math.cos(a*Math.PI/180)*9)} Q${Math.round(Math.sin((a-36)*Math.PI/180)*6)},${Math.round(-Math.cos((a-36)*Math.PI/180)*6)} 0,-11Z" fill="#fffde7" stroke="#fff176" stroke-width=".8" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="5" fill="#ffd54f"/>
          <circle cx="0" cy="0" r="3" fill="#ff8f00"/>
        </g>
      </svg>`
    ]
  },

  /* 15. 百子蓮 Agapanthus ─ 認識分數 */
  {
    id: 'agapanthus', name: '認識分數', chineseName: '百子蓮', icon: '💙',
    difficulty: 3, color: '#3949ab',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,32)}
        <circle cx="28" cy="28" r="5" fill="#7986cb" opacity=".5"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        <ellipse cx="20" cy="38" rx="3" ry="10" fill="#558b2f" transform="rotate(-8,20,38)"/>
        <ellipse cx="36" cy="36" rx="3" ry="10" fill="#558b2f" transform="rotate(8,36,36)"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,16)}
        <ellipse cx="20" cy="36" rx="3" ry="10" fill="#558b2f" transform="rotate(-8,20,36)"/>
        <ellipse cx="36" cy="34" rx="3" ry="10" fill="#558b2f" transform="rotate(8,36,34)"/>
        <circle cx="28" cy="12" r="9" fill="#3949ab" opacity=".7"/>
        <circle cx="28" cy="12" r="5" fill="#7986cb" opacity=".6"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,19)}
        <ellipse cx="20" cy="36" rx="3" ry="10" fill="#558b2f" transform="rotate(-8,20,36)"/>
        <ellipse cx="36" cy="34" rx="3" ry="10" fill="#558b2f" transform="rotate(8,36,34)"/>
        <g transform="translate(28,13)">
          ${[0,40,80,120,160,200,240,280,320].map((a,i)=>`<g transform="rotate(${a})">
            <line x1="0" y1="0" x2="0" y2="-9" stroke="#5c6bc0" stroke-width="1.5"/>
            <ellipse cx="0" cy="-11" rx="3" ry="2.5" fill="${i%3===0?'#3949ab':i%3===1?'#5c6bc0':'#7986cb'}"/>
          </g>`).join('')}
          <circle cx="0" cy="0" r="3" fill="#c5cae9"/>
        </g>
      </svg>`
    ]
  },

  /* 16. 大理花 Dahlia ─ 平面與立體圖形 */
  {
    id: 'dahlia', name: '平面與立體圖形', chineseName: '大理花', icon: '🌸',
    difficulty: 3, color: '#ad1457',
    svgs: [
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}${seedShape()}</svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,33)}
        <ellipse cx="28" cy="29" rx="6" ry="5" fill="#f48fb1" opacity=".6"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,20)}
        ${leafPair(28,38,1)}${leafPair(28,30,-1)}
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,18)}
        ${leafPair(28,38,1)}${leafPair(28,28,-1)}
        <circle cx="28" cy="13" r="10" fill="#ad1457" opacity=".75"/>
        <circle cx="28" cy="13" r="6" fill="#e91e63" opacity=".6"/>
        <circle cx="28" cy="13" r="3" fill="#fce4ec"/>
      </svg>`,
      `<svg viewBox="0 0 56 60" xmlns="http://www.w3.org/2000/svg">${soil()}
        ${stemLine(28,48,28,24)}
        ${leafPair(28,40,1)}${leafPair(28,32,-1)}
        <g transform="translate(28,17)">
          ${[0,22.5,45,67.5,90,112.5,135,157.5,180,202.5,225,247.5,270,292.5,315,337.5].map((a,i)=>`<path d="M0,-11 Q${Math.round(Math.sin((a+11)*Math.PI/180)*8)},${Math.round(-Math.cos((a+11)*Math.PI/180)*8)} ${Math.round(Math.sin(a*Math.PI/180)*10)},${Math.round(-Math.cos(a*Math.PI/180)*10)} Q${Math.round(Math.sin((a-11)*Math.PI/180)*8)},${Math.round(-Math.cos((a-11)*Math.PI/180)*8)} 0,-11Z" fill="${i%2===0?'#ad1457':'#e91e63'}" transform="rotate(${a})"/>`).join('')}
          ${[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>`<path d="M0,-6 Q${Math.round(Math.sin((a+15)*Math.PI/180)*5)},${Math.round(-Math.cos((a+15)*Math.PI/180)*5)} ${Math.round(Math.sin(a*Math.PI/180)*6)},${Math.round(-Math.cos(a*Math.PI/180)*6)} Q${Math.round(Math.sin((a-15)*Math.PI/180)*5)},${Math.round(-Math.cos((a-15)*Math.PI/180)*5)} 0,-6Z" fill="${i%2===0?'#c2185b':'#f06292'}" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="3" fill="#fce4ec"/>
          <circle cx="0" cy="0" r="1.5" fill="#e91e63"/>
        </g>
      </svg>`
    ]
  }
];

/* ------------------------------------------------------------------ */
/*  Grade-aware helpers                                                 */
/* ------------------------------------------------------------------ */

/** Return the active flower list based on current grade */
function getActiveFlowers() {
  return Storage.getGrade() === 2 ? FLOWERS_G2 : FLOWERS;
}

/* ------------------------------------------------------------------ */
/*  Garden Rendering                                                    */
/* ------------------------------------------------------------------ */
function getStage(correct) {
  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (correct >= STAGE_THRESHOLDS[i]) return i;
  }
  return 0;
}

function getProgressPercent(correct) {
  return Math.min(100, Math.round((correct / 50) * 100));
}

function renderFlowerGrid() {
  const grid = document.getElementById('flower-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const flowers = getActiveFlowers();
  const progress = Storage.getActiveProgress();

  flowers.forEach(flower => {
    const p = progress[flower.id] || { correct: 0 };
    const stage = getStage(p.correct);
    const pct = getProgressPercent(p.correct);

    const card = document.createElement('div');
    card.className = 'flower-card' + (stage === 4 ? ' bloomed' : '');
    card.dataset.id = flower.id;
    card.dataset.stage = stage;
    card.title = `${flower.chineseName} — ${flower.name}`;

    card.innerHTML = `
      <div class="flower-svg-wrap">${flower.svgs[stage]}</div>
      <div class="flower-name">${toRuby(flower.chineseName)}</div>
      <div class="flower-mini-progress">
        <div class="flower-mini-fill" style="width:${pct}%"></div>
      </div>`;

    card.addEventListener('click', () => selectFlower(flower.id));
    grid.appendChild(card);
  });

  updateBloomCount();
}

function updateFlowerCard(flowerId) {
  const card = document.querySelector(`.flower-card[data-id="${flowerId}"]`);
  if (!card) return;

  const p = Storage.getFlowerProgress(flowerId);
  const stage = getStage(p.correct);
  const pct = getProgressPercent(p.correct);
  const flower = getActiveFlowers().find(f => f.id === flowerId);
  if (!flower) return;

  card.dataset.stage = stage;
  card.classList.toggle('bloomed', stage === 4);
  card.querySelector('.flower-svg-wrap').innerHTML = flower.svgs[stage];
  card.querySelector('.flower-mini-fill').style.width = pct + '%';

  updateBloomCount();
}

function updateBloomCount() {
  const flowers = getActiveFlowers();
  const progress = Storage.getActiveProgress();
  const count = flowers.filter(f => getStage((progress[f.id] || {correct:0}).correct) === 4).length;
  const el = document.getElementById('bloom-count');
  if (el) el.textContent = count;
}

function selectFlower(flowerId) {
  document.querySelectorAll('.flower-card').forEach(c => c.classList.remove('active'));
  const card = document.querySelector(`.flower-card[data-id="${flowerId}"]`);
  if (card) card.classList.add('active');

  const flower = getActiveFlowers().find(f => f.id === flowerId);
  if (flower) QuestionManager.loadTopic(flower);
}

function triggerLevelUpAnimation(flowerId, newStage) {
  const card = document.querySelector(`.flower-card[data-id="${flowerId}"]`);
  if (card) {
    card.classList.add('levelup-burst');
    setTimeout(() => card.classList.remove('levelup-burst'), 700);

    const fx = document.createElement('div');
    fx.className = 'card-bloom-fx';
    card.appendChild(fx);
    setTimeout(() => fx.remove(), 600);
  }

  const flower = getActiveFlowers().find(f => f.id === flowerId);
  if (!flower) return;

  const overlay = document.getElementById('levelup-overlay');
  const display = document.getElementById('levelup-flower-display');
  const title   = document.getElementById('levelup-title');
  const msg     = document.getElementById('levelup-message');

  display.textContent = flower.icon;
  title.innerHTML = toRuby(flower.chineseName) + ' ' + toRuby(STAGE_NAMES[newStage]) + '<ruby>了<rt>˙ㄌㄜ</rt></ruby>！';

  const msgs = [
    '',
    `太棒了！${flower.chineseName} 發芽了！繼續加油！`,
    `哇！${flower.chineseName} 長葉了！你真厲害！`,
    `好漂亮！${flower.chineseName} 結花苞了！快開花了！`,
    `🎊 ${flower.chineseName} 完全開花了！你是數學高手！`
  ];
  msg.innerHTML = toRuby(msgs[newStage] || '');
  overlay.classList.remove('hidden');
}

