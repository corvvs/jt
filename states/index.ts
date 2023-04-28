import { structurizeJSON } from '@/libs/json';
import { atom, useAtom } from 'jotai';

const defaultRawText = `
{
  "t": true,
  "f": false,
"company_detail": {
  "ticker": "8111",
  "industry_category": "繊維製品",
  "shareholders": [
    {
      "name": "コリアセキュリティーズデポジトリーサムスン（常任代理人シティバンク、エヌ・エイ東京支店）",
      "ratio": 0.1172
    },
    {
      "name": "日本マスタートラスト信託銀行株式会社（信託口）",
      "ratio": 0.1082
    },
    {
      "name": "三井物産株式会社",
      "ratio": 0.0933
    },
    {
      "name": "株式会社北陸銀行",
      "ratio": 0.0423
    },
    {
      "name": "株式会社北國銀行",
      "ratio": 0.0371
    },
    {
      "name": "株式会社西田",
      "ratio": 0.0369
    },
    {
      "name": "公益財団法人ゴールドウイン西田東作スポーツ振興記念財団",
      "ratio": 0.0362
    },
    {
      "name": "株式会社日本カストディ銀行（信託口）",
      "ratio": 0.0353
    },
    {
      "name": "株式会社日本カストディ銀行（信託Ｅ口）",
      "ratio": 0.0332
    },
    {
      "name": "丸紅株式会社",
      "ratio": 0.0308
    }
  ],
  "stock_exchange": [
    "東証プライム"
  ],
  "directors_and_auditors": [
    {
      "name": "西田明男",
      "index": 1630,
      "title": "取締役会長(代表取締役)",
      "is_representative": [
        "代表"
      ]
    },
    {
      "short_title": "社長",
      "name": "渡辺貴生",
      "index": 1631,
      "title": "取締役社長（代表取締役）",
      "is_representative": [
        "代表"
      ]
    },
    {
      "short_title": "専",
      "name": "西田吉輝",
      "index": 1632,
      "title": "取締役専務執行役員商品・調達・富山地区関係会社担当",
      "is_representative": null
    },
    {
      "short_title": "専",
      "name": "本間永一郎",
      "index": 1633,
      "title": "取締役専務執行役員海外担当",
      "is_representative": null
    },
    {
      "short_title": "常",
      "name": "白崎道雄",
      "index": 1634,
      "title": "取締役常務執行役員管理本部長",
      "is_representative": null
    },
    {
      "short_title": "常",
      "name": "森光",
      "index": 1635,
      "title": "取締役常務執行役員事業本部長",
      "is_representative": null
    },
    {
      "name": "森口祐子",
      "index": 1636,
      "title": "取締役",
      "is_representative": null
    },
    {
      "name": "秋山里絵",
      "index": 1637,
      "title": "取締役",
      "is_representative": null
    },
    {
      "name": "好本一郎",
      "index": 1638,
      "title": "取締役",
      "is_representative": null
    },
    {
      "name": "為末大",
      "index": 1639,
      "title": "取締役",
      "is_representative": null
    },
    {
      "short_title": "監",
      "name": "近藤政明",
      "index": 1640,
      "title": "監査役（常勤）",
      "is_representative": null
    },
    {
      "short_title": "監",
      "name": "塩原明之",
      "index": 1641,
      "title": "監査役",
      "is_representative": null
    },
    {
      "short_title": "監",
      "name": "世一秀直",
      "index": 1642,
      "title": "監査役",
      "is_representative": null
    },
    {
      "short_title": "監",
      "name": "森田勉",
      "index": 1643,
      "title": "監査役",
      "is_representative": null
    }
  ],
  "hq": "富山県小矢部市清沢210番地",
  "fy_ir_files": [
    {
      "fy_end_str": "2023-03-31",
      "files_right_row": [
        {
          "issued_date": "2023/2/7",
          "file_id": "8111_TDNET_091220230207501822",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_091220230207501822.pdf?alt=media",
          "order": 10000
        },
        {
          "issued_date": "2022/8/5",
          "file_id": "8111_TDNET_091220220805513306",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_091220220805513306.pdf?alt=media",
          "order": 10000
        },
        {
          "issued_date": "2022/8/19",
          "file_id": "8111_TDNET_140120220819521876",
          "parent_file_id": null,
          "name": "譲渡制限付株式報酬としての自己株式の処分の払込完了に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220819521876.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/7/20",
          "file_id": "8111_TDNET_140120220720502177",
          "parent_file_id": null,
          "name": "譲渡制限付株式報酬としての自己株式の処分に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220720502177.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/7/6",
          "file_id": "8111_TDNET_140120220705595631",
          "parent_file_id": null,
          "name": "自己株式の取得状況および取得終了に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220705595631.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/6/20",
          "file_id": "8111_TDNET_140120220620582631",
          "parent_file_id": null,
          "name": "投資単位の引下げに関する考え方および方針等について",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220620582631.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/6/3",
          "file_id": "8111_TDNET_140120220602569221",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220602569221.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/5/24",
          "file_id": "8111_TDNET_140120220523554937",
          "parent_file_id": null,
          "name": "定款一部変更に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220523554937.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/4/6",
          "file_id": "8111_TDNET_140120220406517934",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220406517934.pdf?alt=media",
          "order": 100
        }
      ],
      "files_left_row": [
        {
          "issued_date": "2023/2/7",
          "file_id": "8111_TDNET_081220230207501800",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220230207501800.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/11/8",
          "file_id": "8111_TDNET_081220221107558094",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220221107558094.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/8/5",
          "file_id": "8111_TDNET_081220220805513302",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220220805513302.pdf?alt=media",
          "order": 100
        }
      ],
      "fy_label": "2023年3月期"
    },
    {
      "fy_end_str": "2022-03-31",
      "files_right_row": [
        {
          "issued_date": "2022/4/26",
          "file_id": "8111_TDNET_091220220426528119",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_091220220426528119.pdf?alt=media",
          "order": 10000
        },
        {
          "issued_date": "2022/2/8",
          "file_id": "8111_TDNET_140120220207582271",
          "parent_file_id": null,
          "name": "配当予想の修正（増配）に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220207582271.pdf?alt=media",
          "order": 10000
        },
        {
          "issued_date": "2022/5/13",
          "file_id": "8111_TDNET_140120220513545408",
          "parent_file_id": null,
          "name": "剰余金の配当（増配）に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220513545408.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/5/9",
          "file_id": "8111_TDNET_140120220509534736",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220509534736.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/2/8",
          "file_id": "8111_TDNET_140120220207582266",
          "parent_file_id": null,
          "name": "自己株式取得に係る事項の決定に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220207582266.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/1/21",
          "file_id": "8111_TDNET_140120220121570363",
          "parent_file_id": null,
          "name": "連結子会社の吸収合併（簡易合併・略式合併）に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120220121570363.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/8/19",
          "file_id": "8111_TDNET_140120210817487356",
          "parent_file_id": null,
          "name": "譲渡制限付株式報酬としての自己株式の処分の払込完了に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210817487356.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/8/11",
          "file_id": "8111_TDNET_140120210811483233",
          "parent_file_id": null,
          "name": "「株式給付信託（従業員持株会処分型）」の再導入に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210811483233.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/7/20",
          "file_id": "8111_TDNET_140120210720469266",
          "parent_file_id": null,
          "name": "譲渡制限付株式報酬としての自己株式の処分に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210720469266.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/6/24",
          "file_id": "8111_TDNET_140120210623454561",
          "parent_file_id": null,
          "name": "当社の企業価値ひいては株主共同の利益を確保・向上するための適正な対応方針（買収防衛策）の継続に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210623454561.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/6/21",
          "file_id": "8111_TDNET_140120210621452271",
          "parent_file_id": null,
          "name": "投資単位の引下げに関する考え方および方針等について",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210621452271.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/5/25",
          "file_id": "8111_TDNET_140120210525427831",
          "parent_file_id": null,
          "name": "当社の企業価値ひいては株主共同の利益を確保・向上するための適正な対応方針（買収防衛策）の継続採用のお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210525427831.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/5/25",
          "file_id": "8111_TDNET_140120210525427825",
          "parent_file_id": null,
          "name": "定款一部変更に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210525427825.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/5/25",
          "file_id": "8111_TDNET_140120210525427794",
          "parent_file_id": null,
          "name": "譲渡制限付株式報酬制度の導入に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210525427794.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/5/14",
          "file_id": "8111_TDNET_140120210513417835",
          "parent_file_id": null,
          "name": "剰余金の配当（記念配当による増配）に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210513417835.pdf?alt=media",
          "order": 100
        }
      ],
      "files_left_row": [
        {
          "issued_date": "2022/6/23",
          "file_id": "8111_EDINET_S100OCH5",
          "parent_file_id": null,
          "name": "有価証券報告書 - 第71期",
          "category": "sr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_EDINET_S100OCH5.pdf?alt=media",
          "order": 1000
        },
        {
          "issued_date": "2022/5/13",
          "file_id": "8111_TDNET_081220220513545323",
          "parent_file_id": null,
          "name": "決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220220513545323.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2022/2/8",
          "file_id": "8111_TDNET_081220220207582254",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220220207582254.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/11/5",
          "file_id": "8111_TDNET_081220211104424728",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220211104424728.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/8/11",
          "file_id": "8111_TDNET_081220210811483228",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220210811483228.pdf?alt=media",
          "order": 100
        }
      ],
      "fy_label": "2022年3月期"
    },
    {
      "fy_end_str": "2021-03-31",
      "files_right_row": [
        {
          "issued_date": "2021/7/6",
          "file_id": "8111_EDINET_S100LY01",
          "parent_file_id": "8111_EDINET_S100LNVO",
          "name": "2021年3月期 訂正有価証券報告書",
          "category": "msr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_EDINET_S100LY01.pdf?alt=media",
          "order": 100000
        },
        {
          "issued_date": "2021/2/5",
          "file_id": "8111_TDNET_140120210205456642",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210205456642.pdf?alt=media",
          "order": 10000
        },
        {
          "issued_date": "2020/8/6",
          "file_id": "8111_TDNET_140120200806476059",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120200806476059.pdf?alt=media",
          "order": 10000
        },
        {
          "issued_date": "2021/1/8",
          "file_id": "8111_TDNET_140120210108442112",
          "parent_file_id": null,
          "name": "自己株式の取得状況および取得終了に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120210108442112.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/12/3",
          "file_id": "8111_TDNET_140120201202430709",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120201202430709.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/11/6",
          "file_id": "8111_TDNET_140120201105416757",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120201105416757.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/10/12",
          "file_id": "8111_TDNET_140120201012402296",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120201012402296.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/9/18",
          "file_id": "8111_TDNET_140120200915493150",
          "parent_file_id": null,
          "name": "第三者割当による自己株式の処分に関するお知らせ（詳細決定）",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120200915493150.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/9/3",
          "file_id": "8111_TDNET_140120200902488678",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120200902488678.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/8/26",
          "file_id": "8111_TDNET_140120200826485829",
          "parent_file_id": null,
          "name": "自己株式の取得期間変更に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120200826485829.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/8/7",
          "file_id": "8111_TDNET_140120200806477335",
          "parent_file_id": null,
          "name": "自己株式立会外買付取引（ToSTNeT-3）による自己株式の取得結果に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120200806477335.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/8/6",
          "file_id": "8111_TDNET_140120200806476092",
          "parent_file_id": null,
          "name": "自己株式立会外買付取引（ToSTNeT-3）による自己株式の買付けに関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120200806476092.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/8/6",
          "file_id": "8111_TDNET_140120200806476076",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120200806476076.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/7/15",
          "file_id": "8111_TDNET_140120200715462649",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_140120200715462649.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/6/22",
          "file_id": "8111_TDNET_081220200619447975",
          "parent_file_id": null,
          "name": "投資単位の引下げに関する考え方および方針等について",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200619447975.pdf?alt=media&token=6a4344be-39b2-4a0c-bed8-15bb47005915",
          "order": 100
        },
        {
          "issued_date": "2020/5/14",
          "file_id": "8111_TDNET_081220200513412888",
          "parent_file_id": null,
          "name": "剰余金の配当に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200513412888.pdf?alt=media&token=28c820d2-bfad-42c7-8b48-43c41c4968ed",
          "order": 100
        },
        {
          "issued_date": "2020/5/14",
          "file_id": "8111_TDNET_081220200513412885",
          "parent_file_id": null,
          "name": "自己株式の消却に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200513412885.pdf?alt=media&token=83e1f8f5-58e3-4e36-ac8a-bd73c24b9f92",
          "order": 100
        },
        {
          "issued_date": "2020/5/14",
          "file_id": "8111_TDNET_081220200513412865",
          "parent_file_id": null,
          "name": "関係会社株式評価損（個別）および持分法による投資損失（連結）の計上に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200513412865.pdf?alt=media&token=8025356a-a2a2-4114-b93e-616c80d51ebc",
          "order": 100
        },
        {
          "issued_date": "2020/5/14",
          "file_id": "8111_TDNET_081220200513412863",
          "parent_file_id": null,
          "name": "一般財団法人ゴールドウイン西田育英財団の設立並びに自己株式の処分及び取得に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200513412863.pdf?alt=media&token=ee3d70fb-f2e6-43e2-b11b-e3200b057da3",
          "order": 100
        }
      ],
      "files_left_row": [
        {
          "issued_date": "2021/6/24",
          "file_id": "8111_EDINET_S100LNVO",
          "parent_file_id": null,
          "name": "有価証券報告書 - 第70期",
          "category": "sr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_EDINET_S100LNVO.pdf?alt=media",
          "order": 1000
        },
        {
          "issued_date": "2021/5/14",
          "file_id": "8111_TDNET_081220210513417841",
          "parent_file_id": null,
          "name": "決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220210513417841.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2021/2/5",
          "file_id": "8111_TDNET_081220210205456556",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220210205456556.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/11/6",
          "file_id": "8111_TDNET_081220201105416744",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220201105416744.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/8/7",
          "file_id": "8111_TDNET_081220200807477976",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200807477976.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/8/6",
          "file_id": "8111_TDNET_081220200806476047",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200806476047.pdf?alt=media",
          "order": 100
        }
      ],
      "fy_label": "2021年3月期"
    },
    {
      "fy_end_str": "2020-03-31",
      "files_right_row": [
        {
          "issued_date": "2020/2/7",
          "file_id": "8111_TDNET_081220200207459646",
          "parent_file_id": null,
          "name": "期末配当予想の修正（増配）に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200207459646.pdf?alt=media&token=e968b50a-a424-418b-8b21-d64e5cea8770",
          "order": 10000
        },
        {
          "issued_date": "2019/8/2",
          "file_id": "8111_TDNET_081220190801481205",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220190801481205.pdf?alt=media&token=552cca5f-b295-4374-a043-1e5abbc2f848",
          "order": 10000
        },
        {
          "issued_date": "2019/8/2",
          "file_id": "8111_TDNET_081220190801481180",
          "parent_file_id": null,
          "name": "株式分割、株式分割に伴う定款の一部変更及び配当予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220190801481180.pdf?alt=media&token=11fc9c31-04b8-4b32-a2bd-9f8f41d66eae",
          "order": 10000
        },
        {
          "issued_date": "2020/2/12",
          "file_id": "8111_TDNET_081220200212462121",
          "parent_file_id": null,
          "name": "代表取締役の異動（社長交代）に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200212462121.pdf?alt=media&token=a7c0e0d7-30c3-48d5-92bc-89ecd2656c9f",
          "order": 100
        },
        {
          "issued_date": "2020/2/7",
          "file_id": "8111_TDNET_081220200207459637",
          "parent_file_id": null,
          "name": "連結子会社の吸収合併（簡易合併・略式合併）に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200207459637.pdf?alt=media&token=9689cdab-8f3c-4034-a9f7-fab7058c75c4",
          "order": 100
        },
        {
          "issued_date": "2019/6/19",
          "file_id": "8111_TDNET_081220190618456472",
          "parent_file_id": null,
          "name": "投資単位の引下げに関する考え方および方針等について",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220190618456472.pdf?alt=media&token=17147548-6e57-489b-95e5-0cb511e1ef04",
          "order": 100
        }
      ],
      "files_left_row": [
        {
          "issued_date": "2020/6/25",
          "file_id": "8111_EDINET_S100IWPV",
          "parent_file_id": null,
          "name": "有価証券報告書 - 第69期",
          "category": "sr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_EDINET_S100IWPV.pdf?alt=media",
          "order": 1000
        },
        {
          "issued_date": "2020/5/14",
          "file_id": "8111_TDNET_081220200513412820",
          "parent_file_id": null,
          "name": "決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200513412820.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2020/2/7",
          "file_id": "8111_TDNET_081220200207459625",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220200207459625.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2019/11/6",
          "file_id": "8111_TDNET_081220191105419560",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220191105419560.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2019/8/2",
          "file_id": "8111_TDNET_081220190801481202",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220190801481202.pdf?alt=media",
          "order": 100
        }
      ],
      "fy_label": "2020年3月期"
    },
    {
      "fy_end_str": "2019-03-31",
      "files_right_row": [
        {
          "issued_date": "2019/2/8",
          "file_id": "8111_TDNET_091220190131467521",
          "parent_file_id": null,
          "name": "業績予想及び配当予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220190131467521.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=D1Y9rIiIsT%2B4MwSg%2BZdFi7eAJNMRVKh2MlA00OxGUhF5EEtKGPv5MxW5VLSx6RxwznCruxW2rw8zTSeP0ap0YTszebt%2FiUNArRgw29krUkxVQ2miVaQl9OVMgSyfzYzTeBFGhrKUSalySUz1msKS9AAVCiOjh9G7tH8bakzrQvuj8yliQjL6RBX28ZzASC4Ge6sDpSj5jRfBFzwQzP%2FcH%2BsQX3gTuFv6YJhpAXK%2BVSJTmKL8oDL2of%2FC81rsjvlCCSYQc6KHYFC3NHqMMGJizJ9XLoHgU4MvcbxlPrZ3qGRNIwC8g7regRUry6mwbqBnbqOKtZQXqehZQBVVBc18%2Bg%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2018/8/3",
          "file_id": "8111_TDNET_081220180801490073",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180801490073.pdf?alt=media&token=dd4c4b53-d47b-473c-ae93-ccd6acbafab8",
          "order": 10000
        },
        {
          "issued_date": "2018/11/6",
          "file_id": "8111_TDNET_081220181105430141",
          "parent_file_id": null,
          "name": "中期経営計画の数値目標の修正に関するお知らせ",
          "category": "materials",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220181105430141.pdf?alt=media&token=a9ad6d92-06ec-4135-86a9-7658a7aa3789",
          "order": 1000
        },
        {
          "issued_date": "2019/3/28",
          "file_id": "8111_TDNET_081220190327496516",
          "parent_file_id": null,
          "name": "指名・報酬諮問委員会の設置に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220190327496516.pdf?alt=media&token=327efe00-b858-4f29-b54a-8b96cbcca3c9",
          "order": 100
        },
        {
          "issued_date": "2019/2/8",
          "file_id": "8111_TDNET_081220190208473492",
          "parent_file_id": null,
          "name": "連結子会社の吸収合併（簡易合併・略式合併）及び債権放棄に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220190208473492.pdf?alt=media&token=ed807e93-8197-415c-ab1d-d178c6ba6e3e",
          "order": 100
        },
        {
          "issued_date": "2019/1/15",
          "file_id": "8111_TDNET_081220190111459190",
          "parent_file_id": null,
          "name": "連結子会社の事業撤退に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220190111459190.pdf?alt=media&token=34cb971f-d125-40ce-b14f-2f86e639c144",
          "order": 100
        },
        {
          "issued_date": "2018/11/6",
          "file_id": "8111_TDNET_081220181105430111",
          "parent_file_id": null,
          "name": "剰余金の配当（中間配当）に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220181105430111.pdf?alt=media&token=64a43064-f871-4716-893a-6f3198f6e9da",
          "order": 100
        },
        {
          "issued_date": "2018/8/6",
          "file_id": "8111_TDNET_081220180802491039",
          "parent_file_id": null,
          "name": "自己株式立会外買付取引（ToSTNeT-3）による自己株式の取得結果及び取得終了に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180802491039.pdf?alt=media&token=1831ba55-0fda-4cd1-b50a-9821797a51b6",
          "order": 100
        },
        {
          "issued_date": "2018/8/3",
          "file_id": "8111_TDNET_081220180802491038",
          "parent_file_id": null,
          "name": "自己株式の取得及び自己株式立会外買付取引（ToSTNeT-3）による自己株式の買付けに関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180802491038.pdf?alt=media&token=f3e9de18-75b4-4441-80eb-ebf66b286989",
          "order": 100
        },
        {
          "issued_date": "2018/6/28",
          "file_id": "8111_TDNET_081220180621467815",
          "parent_file_id": null,
          "name": "投資単位の引下げに関する考え方および方針等について",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180621467815.pdf?alt=media&token=3a2b08c1-f7f1-4ea1-8434-2286e0f9ca37",
          "order": 100
        },
        {
          "issued_date": "2018/6/28",
          "file_id": "8111_TDNET_081220180621467792",
          "parent_file_id": null,
          "name": "当社の企業価値ひいては株主共同の利益を確保・向上するための適正な対応方針（買収防衛策）の継続に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180621467792.pdf?alt=media&token=57fb364a-46d4-472e-856f-b92643910dfb",
          "order": 100
        },
        {
          "issued_date": "2018/5/24",
          "file_id": "8111_TDNET_081220180523444458",
          "parent_file_id": null,
          "name": "当社の企業価値ひいては株主共同の利益を確保・向上するための適正な対応方針（買収防衛策）の継続採用のお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180523444458.pdf?alt=media&token=9c59592f-48ea-4e0a-9f07-9b96e7957475",
          "order": 100
        },
        {
          "issued_date": "2018/5/15",
          "file_id": "8111_TDNET_081220180514438150",
          "parent_file_id": null,
          "name": "配当方針の変更（中間配当の実施）に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180514438150.pdf?alt=media&token=aa99decf-bdff-4f95-92f7-87f939f8c442",
          "order": 100
        }
      ],
      "files_left_row": [
        {
          "issued_date": "2019/6/26",
          "file_id": "8111_EDINET_S100G80V",
          "parent_file_id": null,
          "name": "有価証券報告書 - 第68期",
          "category": "sr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_EDINET_S100G80V.pdf?alt=media",
          "order": 1000
        },
        {
          "issued_date": "2019/5/14",
          "file_id": "8111_TDNET_081220190513424730",
          "parent_file_id": null,
          "name": "決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220190513424730.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2019/2/8",
          "file_id": "8111_TDNET_081220190208473388",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220190208473388.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2018/11/6",
          "file_id": "8111_TDNET_081220181105430094",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220181105430094.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2018/8/3",
          "file_id": "8111_TDNET_081220180802491037",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180802491037.pdf?alt=media",
          "order": 100
        }
      ],
      "fy_label": "2019年3月期"
    },
    {
      "fy_end_str": "2018-03-31",
      "files_right_row": [
        {
          "issued_date": "2018/2/6",
          "file_id": "8111_TDNET_081220180202462563",
          "parent_file_id": null,
          "name": "業績予想及び配当予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180202462563.pdf?alt=media&token=eee4415e-029b-4f4c-b31a-b2cfc88c7fc2",
          "order": 10000
        },
        {
          "issued_date": "2017/11/7",
          "file_id": "8111_TDNET_091220171027400920",
          "parent_file_id": null,
          "name": "業績予想及び配当予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220171027400920.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=TyN3WBKuv%2BUILzkkT7UBlZA%2BFiCswBpn%2F23dgO2BUAgQk%2FBq8Lhg%2Bt4GMb9GHyO27gfgjEI76OhCMyTG5UeCtlKb%2FSdkbXuaDkfRtke9PW7%2BACWabmiR%2FPCWZ0yVBDlKY%2Bs7%2B03XRex0hi9TEMVCT0iCuRQfjRnQmDscEiKlxh%2FGrxl5e3Etw89C3bCZXxcvhSxuGe2DUZtVgDDaIwyBNz7yAO3lIua9PyYXY37LyXxI6HisA9K3k0FegGhtGz4Aq8s9P3usWDu2OZRQYUGUbsmSlHZfNGryZL%2BS7%2BwyYbs9Es0y95uR0i5aWOixeIYCRlaXPNKLyL0tZRua83N2Zg%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2017/11/1",
          "file_id": "8111_TDNET_091220171023496073",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220171023496073.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=abmLMebgPP%2F1cqEaQE%2Fzjv2GfF3bmUNPBlmjD2Db6P0ymgWpE%2B%2B5hY9zyH6A1BpfYOApdbccNhzDf2EDX%2FBIA8PtwEE1YSlJtu1Ytvmu92smCVRqyZFGp4B4h4H4jiqLTP3RiKSFUk%2BnaSdQYxiqrduebvukYirpULjdJwdO1qM6q7%2BzrTKwv1%2FLa%2BEDS5tq9FMsyrO6LA7ZCLddZlAccoL0WhM0bR7WWLDxqLXzthcPmF5UWCcuVa5ICIPzmBf54ZjkvJSWt%2BGOj8xCMwXOWT2xQvzOpIky9KV6WOnIyP9E2cXwXhZPj50WIT1mtUi30uLY%2Bans2tgqBodre7%2FuUg%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2017/8/3",
          "file_id": "8111_TDNET_091220170801445563",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220170801445563.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=GiI6TXCRTpRjO77gCfboTw4prt31iMGtfMouYzoiWNok%2B1z11VFelvYxQ8kKgeEuinNJ59s6IjIoEu5OQ%2BiE%2B8pgNAx0fbxdf1FJf0BHIdvLxFpIbq5hW3VMidK%2FYucJpkII3QV3pECiByCdahu5nDI2XZDwQs0YJBoiDRHioxQZuWfJ2jnrdxPi9mvBZW8%2FDr47Q5C1IhUS1YGWrRchfRYJeeXK4Vno9umab%2BhjTmyPuipv4mJ2Xdg6uHSc4bmDmSs55bfuMBGNHEvbMRUSpPzObej16wXJ%2B%2FpCKMWv4oJM8Pd9LUkVW3ijEtZIHsvQjP9t%2BKLx%2Bbe8tBt83j6bcg%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2017/5/12",
          "file_id": "8111_TDNET_091220170508460917",
          "parent_file_id": null,
          "name": "配当予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220170508460917.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=sh2P59UdXcWkVDXf6FBD1Pd1PnzipKftH9F5yYF%2B8ZnBV74sm0horIB6SVzQkld%2BZu7iX1DUDYiLer71HkDRTl5jmsZxseBC9n%2F7nJnm5fOSbvJiBax2AGsTfgH0wLZIr5RvEQYqsD%2B48n3oTtobQQMEEKwj60ibeLSQrliba%2F3%2Fq3UesSZ7NDNYg2h15%2Fs2yPOE4UO9I%2BUqx%2B6F7PdjsQerZ21tMOE2Wow8d6SgsOPojU7frsZUZ9W7PpWYVN04MOtglwzlg%2BD0kVSfnV7QprJHzI%2FaYrpuSxxOHVWl%2FgpFMbt9ZinqZTEkVbvvGJ8hxY8vfQhjpUAcRzHFc9%2Fpzw%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2018/2/6",
          "file_id": "8111_TDNET_081220180205464430",
          "parent_file_id": null,
          "name": "第三者割当による自己株式の処分に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180205464430.pdf?alt=media&token=c51ef25c-ee34-4ab5-a90c-619d6bb5b0ca",
          "order": 100
        },
        {
          "issued_date": "2018/2/6",
          "file_id": "8111_TDNET_081220180205464428",
          "parent_file_id": null,
          "name": "株式分割及び株式分割に伴う定款の一部変更に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180205464428.pdf?alt=media&token=4185ab36-921f-4e59-897c-c3c010e834b5",
          "order": 100
        },
        {
          "issued_date": "2017/11/1",
          "file_id": "8111_TDNET_081220171020494475",
          "parent_file_id": null,
          "name": "自己株式の取得状況および取得終了に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220171020494475.pdf?alt=media&token=113945dd-8392-48fc-acbb-f47382055ea7",
          "order": 100
        },
        {
          "issued_date": "2017/10/4",
          "file_id": "8111_TDNET_081220170926478846",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170926478846.pdf?alt=media&token=2c80a5bc-7341-4d6c-a1d6-95ffc27d41f1",
          "order": 100
        },
        {
          "issued_date": "2017/9/5",
          "file_id": "8111_TDNET_081220170830465001",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170830465001.pdf?alt=media&token=a691fd0f-1ab5-4688-84ec-3b19078ceae4",
          "order": 100
        },
        {
          "issued_date": "2017/8/3",
          "file_id": "8111_TDNET_081220170801445536",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170801445536.pdf?alt=media&token=232edcb8-67be-424a-b8e0-e0cb50ad4ec9",
          "order": 100
        },
        {
          "issued_date": "2017/7/10",
          "file_id": "8111_TDNET_081220170710428585",
          "parent_file_id": null,
          "name": "ＷＯＯＬＲＩＣＨＩＮＴＥＲＮＡＴＩＯＮＡＬＬＩＭＩＴＥＤの少数株主持分の取得（持分法適用関連会社化）に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170710428585.pdf?alt=media&token=a76a69e0-963f-4b44-847a-d541c7c73287",
          "order": 100
        },
        {
          "issued_date": "2017/7/7",
          "file_id": "8111_TDNET_081220170706426260",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170706426260.pdf?alt=media&token=229a88fe-cacb-4050-8fbe-23dcc14b84d9",
          "order": 100
        },
        {
          "issued_date": "2017/6/28",
          "file_id": "8111_TDNET_081220170626416587",
          "parent_file_id": null,
          "name": "投資単位の引下げに関する考え方および方針等について",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170626416587.pdf?alt=media&token=5016f9e0-45bf-4cb8-a885-4b1e6bd9f426",
          "order": 100
        },
        {
          "issued_date": "2017/6/28",
          "file_id": "8111_TDNET_081220170626416585",
          "parent_file_id": null,
          "name": "自己株式の取得期間変更に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170626416585.pdf?alt=media&token=3f8e75b2-f5a4-437e-a810-e259b9b82431",
          "order": 100
        },
        {
          "issued_date": "2017/5/23",
          "file_id": "8111_TDNET_081220170518476711",
          "parent_file_id": null,
          "name": "剰余金の配当に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170518476711.pdf?alt=media&token=6eedba95-1952-44b4-883e-9bb03332140e",
          "order": 100
        },
        {
          "issued_date": "2017/4/25",
          "file_id": "8111_TDNET_081220170425449568",
          "parent_file_id": null,
          "name": "一般財団法人ゴールドウイン西田東作スポーツ振興記念財団の設立並びに自己株式の処分及び取得に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170425449568.pdf?alt=media&token=df43b653-cbdd-4201-a4e3-b8299fc52ca5",
          "order": 100
        }
      ],
      "files_left_row": [
        {
          "issued_date": "2018/6/28",
          "file_id": "8111_EDINET_S100DG8N",
          "parent_file_id": null,
          "name": "有価証券報告書 - 第67期",
          "category": "sr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_EDINET_S100DG8N.pdf?alt=media",
          "order": 1000
        },
        {
          "issued_date": "2018/5/15",
          "file_id": "8111_TDNET_081220180514438118",
          "parent_file_id": null,
          "name": "決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180514438118.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2018/2/6",
          "file_id": "8111_TDNET_081220180205464432",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220180205464432.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2017/11/7",
          "file_id": "8111_TDNET_081220171020494487",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220171020494487.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2017/8/3",
          "file_id": "8111_TDNET_081220170726439905",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170726439905.pdf?alt=media",
          "order": 100
        }
      ],
      "fy_label": "2018年3月期"
    },
    {
      "fy_end_str": "2017-03-31",
      "files_right_row": [
        {
          "issued_date": "2017/2/3",
          "file_id": "8111_TDNET_091220170203489331",
          "parent_file_id": null,
          "name": "業績予想及び配当予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220170203489331.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=omM%2FVPknHhM%2B7KfxNk0mBHI1Ki9%2Bgrfq%2BFaJ7TsWR8ztxdyq5rgNdFAdOWwN9P775yArbrDTj6drxJTQoZD1NE5nybjoS4MmqLTxx3arkNHVINF6KOJ9BzuttWgqE9TZFl72BilYilPUd6nUtK815TQz1ZyrKmBKI9Ern8GhRmWopB5VVh3BfexQhn90TSiFmtofHmUEOhT73NvUzuyz%2Bj1BlfeNQwwrSFV%2BAU1%2B3RonjUrL1g2TYJhF7RjRXJisG1PqsFhtPEuMG0w7yfAEI%2B%2B2oVceQsJHXK27DKjH11jhzLNuN1zdNxsCcemscXPX6FePf%2FnKcHbaUYWAXytVLA%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2016/11/1",
          "file_id": "8111_TDNET_091220161018415061",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220161018415061.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=qhbfdaJY9yKPvR4X37wj5CecVgt1rJhKZfhkMQUWVfhbMY8pecSYSe2NfcS3bmEwlCYDuKFWI6nSdfBDMeEEjxNi9pb1NwGy9su%2FN0KBM2v70hiCQ15oaMvGjGtYSjRB9wCZqudyBWpzGXzgiJurnRwUD3fSIVnGC4RHeNuknxIa4f62Qf%2FLTO9rgIIwx4KvyVL6lEBc1ukwg%2F3N72lBWxcNfSLd1n0scxIL878aJLhzMo1L3M26H5F4w2N0Be1ubwsLEuYbZAwwDkVNYgUXkiqlibWHA8JjJvw8Dl%2B1fMXV7%2BgMKVhO%2B7h0VUqaHST6stqRGLV0gtprGuHYj4ncIQ%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2017/2/3",
          "file_id": "8111_TDNET_081220170202488568",
          "parent_file_id": null,
          "name": "「株式給付信託（従業員持株会処分型）」の再導入に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170202488568.pdf?alt=media&token=85ae972e-b749-4c0d-9b6a-8b5b07c939f4",
          "order": 100
        },
        {
          "issued_date": "2016/9/30",
          "file_id": "8111_TDNET_081220160928402526",
          "parent_file_id": null,
          "name": "人工合成クモ糸繊維を使用したＭＯＯＮＰＡＲＫＡ（ムーンパーカ）発売延期に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220160928402526.pdf?alt=media&token=fa445955-c81c-46eb-a0e5-c5604ea20aa1",
          "order": 100
        }
      ],
      "files_left_row": [
        {
          "issued_date": "2017/6/28",
          "file_id": "8111_EDINET_S100AMXA",
          "parent_file_id": null,
          "name": "有価証券報告書 - 第66期",
          "category": "sr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_EDINET_S100AMXA.pdf?alt=media",
          "order": 1000
        },
        {
          "issued_date": "2017/5/12",
          "file_id": "8111_TDNET_081220170424449118",
          "parent_file_id": null,
          "name": "決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170424449118.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2017/2/3",
          "file_id": "8111_TDNET_081220170125480673",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220170125480673.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2016/11/8",
          "file_id": "8111_TDNET_081220161021418065",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220161021418065.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2016/8/2",
          "file_id": "8111_TDNET_081220160725456816",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220160725456816.pdf?alt=media",
          "order": 100
        }
      ],
      "fy_label": "2017年3月期"
    },
    {
      "fy_end_str": "2016-03-31",
      "files_right_row": [
        {
          "issued_date": "2016/2/3",
          "file_id": "8111_TDNET_091220160201402181",
          "parent_file_id": null,
          "name": "配当予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220160201402181.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=FY%2FxMEd9rzh52jlhkgsAnPzU3MwlA7OHMdPSec%2BgO1E5Vp2DVz32wcpm43LQeKe%2FLhyu5IptEKIzkE%2Fda5WtsdpZgl06ygIE3umwXYxZbRKQXhtHPc9ehJvzjmtMYJwfsONRFAIVpSXAXiPfC%2BWmF5WLCeVCA1V2xiXuKfBtVWuzDd2YXuLj4WWhKdPWeecCHRkuzZDnt89AV1V1LM901zW%2FByPHPzHcG3n0cggwRlJO3wVqdkx%2Fy0ZhekfTazrPeuX2Y5rjj7vWB59xYV0uhO1YX3VSdrly1KUAJr4p9PbONmxu8qDjDbjwY%2BUBhaTjxa0f8m4fOHkE5tPEJg1twg%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2015/10/27",
          "file_id": "8111_TDNET_091220151026425568",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220151026425568.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=JR2mXr7DKz2dJl40gEY%2BjuEdn3KBvuhifcAROGYvVaOoGxP3PuX4aO28s5y1Z6gERff575BKGwvZPwC%2F%2BCnaST5Yw6%2BZXO9EYVtDFExRuD9HG9MX6tsisBg9WtDjXQjDGyJemT1YZX8SW4vCJL%2Fx6oH8ZvlUUpHdh0zMoU%2Bf0uDKdQy1VB6EqJKYxiuagZQpg%2BoKbguZg8gLV2o3r%2B9SGBv%2BOHQzCHBodFPmzXa5KFEq1xlSzm0uklzJuTlfBfzUubF0LiOlCp80B2mYFcjbqSIa7kGfRuagoVnwIW%2BH541lmzk0wHzzsVcKCp5pKx64GclKqNUl0N7HGrYqcF1HaQ%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2015/5/26",
          "file_id": "8111_TDNET_091220150526491566",
          "parent_file_id": null,
          "name": "株式併合、単元株式数の変更、定款の一部変更および配当予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220150526491566.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=begX4opuH8uOfJfgm%2BXPDQJSQpNDRxIzhxWhng0nrI8vvsfx%2BXGbzCuLtl2IBzCmf%2F9I7siGDmXeTjRoludHpH9rUMcoM%2FV6SzzQpu9uSyF9rJkJcLE5mqUuWe4TnP8NOLm5z195WOsZv4M72HDwuE3CJeXYcqN3o0hsnungAHiL0FNFBnxoVfpOz1cyx1L4Z7UPMVieHco9WhuVbf4zVtbxpN8UO%2FiRtwcwXbrPnzhPJvD03HZjmJgHkVEv%2FIodQH7mLFDsT91lQfKBrLKAanOXTO%2FH1bBxPpe2ZoFeX%2FA2q3KiV7KW86JwgVLRIcz%2F3W4LwAEoHtOVgILkqiw3JA%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2015/9/8",
          "file_id": "8111_TDNET_081220150908493095",
          "parent_file_id": null,
          "name": "Ｓｐｉｂｅｒ株式会社との事業提携契約の締結並びに出資に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150908493095.pdf?alt=media&token=aaf26937-f8b8-44a6-87d6-290bf5dd066b",
          "order": 100
        },
        {
          "issued_date": "2015/6/25",
          "file_id": "8111_TDNET_081220150623427242",
          "parent_file_id": null,
          "name": "当社の企業価値ひいては株主共同の利益を確保・向上するための適正な対応方針（買収防衛策）の継続に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150623427242.pdf?alt=media&token=d9624969-7aa3-412b-8c9c-4a78edf3029b",
          "order": 100
        },
        {
          "issued_date": "2015/5/26",
          "file_id": "8111_TDNET_081220150526491237",
          "parent_file_id": null,
          "name": "当社の企業価値ひいては株主共同の利益を確保・向上するための適正な対応方針(買収防衛策)の継続採用に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150526491237.pdf?alt=media&token=6f5e90c8-7e20-419e-8ff8-ea0d4da7c2b3",
          "order": 100
        },
        {
          "issued_date": "2015/5/14",
          "file_id": "8111_TDNET_081220150513475993",
          "parent_file_id": null,
          "name": "「Champion」ブランド事業譲渡に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150513475993.pdf?alt=media&token=0b4a9cff-0bf4-46e0-bd89-586c493a8c74",
          "order": 100
        }
      ],
      "files_left_row": [
        {
          "issued_date": "2016/6/23",
          "file_id": "8111_EDINET_S1007U5Y",
          "parent_file_id": null,
          "name": "有価証券報告書 - 第65期",
          "category": "sr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_EDINET_S1007U5Y.pdf?alt=media",
          "order": 1000
        },
        {
          "issued_date": "2016/5/13",
          "file_id": "8111_TDNET_081220160427468826",
          "parent_file_id": null,
          "name": "決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220160427468826.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2016/2/3",
          "file_id": "8111_TDNET_081220160120491076",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220160120491076.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2015/11/6",
          "file_id": "8111_TDNET_081220151021421264",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220151021421264.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2015/8/5",
          "file_id": "8111_TDNET_081220150717453292",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150717453292.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2015/5/14",
          "file_id": "8111_TDNET_081220150514476510",
          "parent_file_id": null,
          "name": "決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150514476510.pdf?alt=media",
          "order": 100
        }
      ],
      "fy_label": "2016年3月期"
    },
    {
      "fy_end_str": "2015-03-31",
      "files_right_row": [
        {
          "issued_date": "2015/2/4",
          "file_id": "8111_TDNET_091220150127012065",
          "parent_file_id": null,
          "name": "業績予想及び配当予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220150127012065.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=K1KSNv8DWgh9yB%2FRvrTQpCf5crEXwGBf%2BayJ56tHXReLJbqWHCsKqpjiUf0tzKLnYR3Pf8Xh2%2Bg92MiFXwakeyn%2B9u8yGLLXCeOFbf6nx5yq3qt2D1hh%2FmV4bCAv6D56TeU6r%2FjfXYStDEZZ8cj1qrrmRlrsdS9687Rzde4L6bfAYMIMCbb1ErpyiqpXpKDDX0PKM1IGO%2BEd8wpRC9ua5k%2Ffz0hxeSm9IwrACrR0xpzsZ5p%2B8PKAGTmb7XtMocnKEQMQKRIoLR52XTt933knapCA%2FoYpHWIairdr2n8i%2B4AtDr4rk2f1naH9QpLjSt3tDhDll%2B1wmG9x7sdN7bwWQQ%3D%3D",
          "order": 10000
        },
        {
          "issued_date": "2015/3/2",
          "file_id": "8111_TDNET_081220150302401070",
          "parent_file_id": null,
          "name": "第三者割当による自己株式処分の払込完了に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150302401070.pdf?alt=media&token=eb3348db-7cca-4c80-9cfc-5046f21c31a7",
          "order": 100
        },
        {
          "issued_date": "2015/2/4",
          "file_id": "8111_TDNET_081220150203018143",
          "parent_file_id": null,
          "name": "株式給付信託（J-ESOP）の導入（詳細決定）に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150203018143.pdf?alt=media&token=6ad05c5c-626a-4928-a0cf-dbc77852b333",
          "order": 100
        },
        {
          "issued_date": "2015/2/4",
          "file_id": "8111_TDNET_081220150203018125",
          "parent_file_id": null,
          "name": "第三者割当による自己株式の処分に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150203018125.pdf?alt=media&token=1a5ef941-0996-4f27-81f6-c25e8a468b50",
          "order": 100
        },
        {
          "issued_date": "2015/2/2",
          "file_id": "8111_TDNET_081220150130015705",
          "parent_file_id": null,
          "name": "自己株式の取得状況および取得終了に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150130015705.pdf?alt=media&token=57c0d0a8-1ba2-4ad9-b453-ad91a2cb7c74",
          "order": 100
        },
        {
          "issued_date": "2015/1/7",
          "file_id": "8111_TDNET_081220141224098043",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220141224098043.pdf?alt=media&token=cd6000aa-ddb9-4bf5-8a86-dcae5b50bce8",
          "order": 100
        },
        {
          "issued_date": "2014/12/4",
          "file_id": "8111_TDNET_081220141202088343",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220141202088343.pdf?alt=media&token=943b295b-50a5-43a2-9a96-8a7244144f77",
          "order": 100
        },
        {
          "issued_date": "2014/11/6",
          "file_id": "8111_TDNET_091220141030069832",
          "parent_file_id": null,
          "name": "第２四半期累計期間における業績予想値と決算値との差異に関するお知らせ",
          "category": "pr",
          "url": "https://storage.googleapis.com/aurea-a7736.appspot.com/sourcefile%2F8111%2F8111_TDNET_091220141030069832.pdf?GoogleAccessId=firebase-adminsdk-mm9cw%40aurea-a7736.iam.gserviceaccount.com&Expires=7258118400&Signature=vFVRFKuwGgyzIbXVYjiOJ%2B0iHgRt5jjVUHuU2UpvuxEpqfYpxO3v41xSbvFyJ%2FTp9U%2BRdNLSSm1YCnwcuM9CPkcM6omAC7bcjTImGInxcQq7JopMDVbWrMtDplifEfFlJbwZjNKpXT8Hcb66hegMqiia3haODsnF2r7PseNbwGqO%2BiTDL8YRcHEUVRkcOMYNJf1sXXR%2FcJ1534ix%2FlcJYmP6Km88lEEYYU0fmr07lIvXEC26VIqWqrPCT1WMukqRhyqk3D%2BpJE8eJFpGWmPfLlrgzrpp%2Fl0fS3qugleMFyb7JRM4k7teUrkvtdZH2C4UbkSGg8T7%2B23ULTVNM0sZlg%3D%3D",
          "order": 100
        },
        {
          "issued_date": "2014/11/6",
          "file_id": "8111_TDNET_081220141031071506",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220141031071506.pdf?alt=media&token=1b71baa3-fe67-48da-9289-2c30a3b27e3f",
          "order": 100
        },
        {
          "issued_date": "2014/10/3",
          "file_id": "8111_TDNET_081220141003053515",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220141003053515.pdf?alt=media&token=ff2aa2fc-fad7-45bc-92be-ff0842410b4e",
          "order": 100
        },
        {
          "issued_date": "2014/9/3",
          "file_id": "8111_TDNET_081220140903040585",
          "parent_file_id": null,
          "name": "自己株式の取得状況に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220140903040585.pdf?alt=media&token=08b31dba-610d-4a62-b0f9-2f72347e2db8",
          "order": 100
        },
        {
          "issued_date": "2014/8/6",
          "file_id": "8111_TDNET_081220140806027857",
          "parent_file_id": null,
          "name": "（訂正）「自己株式取得に係る事項の決定に関するお知らせ」の一部訂正について",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220140806027857.pdf?alt=media&token=d0d7b93b-d867-4bf7-8889-121cfcedef2a",
          "order": 100
        },
        {
          "issued_date": "2014/8/5",
          "file_id": "8111_TDNET_081220140730022963",
          "parent_file_id": null,
          "name": "自己株式取得に係る事項の決定に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220140730022963.pdf?alt=media&token=2b543ef6-c4f4-4984-a3f9-5cd5880950a1",
          "order": 100
        },
        {
          "issued_date": "2014/8/5",
          "file_id": "8111_TDNET_081220140730022947",
          "parent_file_id": null,
          "name": "株式給付信託（Ｊ－ＥＳＯＰ）の導入に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220140730022947.pdf?alt=media&token=7477ea8c-f04f-4d3b-9a8f-493d05878e0f",
          "order": 100
        }
      ],
      "files_left_row": [
        {
          "issued_date": "2015/2/4",
          "file_id": "8111_TDNET_081220150122009354",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220150122009354.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2014/11/6",
          "file_id": "8111_TDNET_081220141022062202",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220141022062202.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2014/8/5",
          "file_id": "8111_TDNET_081220140805027139",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220140805027139.pdf?alt=media",
          "order": 100
        }
      ],
      "fy_label": "2015年3月期"
    },
    {
      "fy_end_str": "2014-03-31",
      "files_right_row": [
        {
          "issued_date": "2014/2/7",
          "file_id": "8111_TDNET_091220140205000083",
          "parent_file_id": null,
          "name": "業績予想及び配当予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_091220140205000083.pdf?alt=media&token=2557dfc0-328e-4717-9e8f-534d4aa14290",
          "order": 10000
        },
        {
          "issued_date": "2013/5/9",
          "file_id": "8111_TDNET_091220130501029047",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_091220130501029047.pdf?alt=media&token=ac8548f4-24ca-4519-8c50-014a0824a07f",
          "order": 10000
        },
        {
          "issued_date": "2012/11/9",
          "file_id": "8111_TDNET_091220121107033711",
          "parent_file_id": null,
          "name": "業績予想の修正に関するお知らせ",
          "category": "settlement",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_091220121107033711.pdf?alt=media&token=b7888370-5130-4a29-ba3c-a87565879fef",
          "order": 10000
        },
        {
          "issued_date": "2013/5/14",
          "file_id": "8111_TDNET_081220130513040580",
          "parent_file_id": null,
          "name": "中期経営計画策定に関するお知らせ",
          "category": "materials",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220130513040580.pdf?alt=media&token=c68aa072-d79c-47b8-8466-1069d7a82b16",
          "order": 1000
        },
        {
          "issued_date": "2012/11/13",
          "file_id": "8111_TDNET_081220121112037363",
          "parent_file_id": null,
          "name": "「株式給付信託（従業員持株会処分型）」の導入（詳細決定）に関するお知らせ",
          "category": "pr",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220121112037363.pdf?alt=media&token=a3225bec-32c6-493d-a694-9ddb7d4157d0",
          "order": 100
        }
      ],
      "files_left_row": [
        {
          "issued_date": "2014/5/13",
          "file_id": "8111_TDNET_081220140509058345",
          "parent_file_id": null,
          "name": "決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220140509058345.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2014/2/7",
          "file_id": "8111_TDNET_081220140123089715",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220140123089715.pdf?alt=media",
          "order": 100
        },
        {
          "issued_date": "2013/11/13",
          "file_id": "8111_TDNET_081220131029047374",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220131029047374.pdf?alt=media&token=d6a9dc7a-7165-4d6e-8f8a-2859ccb4e57f",
          "order": 100
        },
        {
          "issued_date": "2013/8/9",
          "file_id": "8111_TDNET_081220130729001601",
          "parent_file_id": null,
          "name": "第１四半期決算短信[日本基準](連結)",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220130729001601.pdf?alt=media&token=f8833c54-6cd9-4672-aae2-ef693cdae27f",
          "order": 100
        },
        {
          "issued_date": "2013/5/14",
          "file_id": "8111_TDNET_081220130507032265",
          "parent_file_id": null,
          "name": "決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220130507032265.pdf?alt=media&token=43b2bd17-7d55-423b-bb24-ae51128fe680",
          "order": 100
        },
        {
          "issued_date": "2013/2/8",
          "file_id": "8111_TDNET_081220130129073172",
          "parent_file_id": null,
          "name": "第３四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220130129073172.pdf?alt=media&token=bcfb7d81-b47c-42f5-a0fa-fa95b5b2a5fe",
          "order": 100
        },
        {
          "issued_date": "2012/11/13",
          "file_id": "8111_TDNET_081220121031028352",
          "parent_file_id": null,
          "name": "第２四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220121031028352.pdf?alt=media&token=407d9049-8992-4a2a-8eee-0290c3ebcb18",
          "order": 100
        },
        {
          "issued_date": "2012/8/10",
          "file_id": "8111_TDNET_081220120730086440",
          "parent_file_id": null,
          "name": "第１四半期決算短信〔日本基準〕（連結）",
          "category": "fs",
          "url": "https://firebasestorage.googleapis.com/v0/b/aurea-dev.appspot.com/o/sourcefile%2F8111%2F8111_TDNET_081220120730086440.pdf?alt=media&token=bdabd5fd-5cfc-4014-af92-d766bd8f0e4c",
          "order": 100
        }
      ],
      "fy_label": "2014年3月期"
    }
  ],

  "employee": "<2022.3> 連1510名 単1188名(44.5歳) [平均給与] 637.7万円",
  "industry_code33": "3100",
  "segments": [
    {
      "single_segment": true,
      "single_statement": "当社グループは、スポーツ用品関連事業の単一セグメントであるため、記載を省略しております。",
      "ex_netsales_ratio": 1,
      "name": "（単一セグメントにつき省略）",
      "opm": 0.1679747544154324
    }
  ],
  "market": "東証プライム",
  "industry_code17": "4",
  "name_jp": "ゴールドウイン",
  "dependence": "2022年3月期有価証券報告書",
  "performance_magnitude": 1000000000,
  "prices": [
    {
      "volume": 125600,
      "date": 1525100400,
      "close": 3380
    },
    {
      "volume": 58200,
      "date": 1525186800,
      "close": 3395
    },
    {
      "volume": 0,
      "date": 1525273200,
      "close": 3395
    },
    {
      "volume": 0,
      "date": 1525359600,
      "close": 3395
    },
    {
      "volume": 63800,
      "date": 1525618800,
      "close": 3460
    },
    {
      "volume": 194400,
      "date": 1525705200,
      "close": 3590
    },
    {
      "volume": 195200,
      "date": 1525791600,
      "close": 3590
    },
    {
      "volume": 133600,
      "date": 1525878000,
      "close": 3600
    },
    {
      "volume": 122200,
      "date": 1525964400,
      "close": 3670
    },
    {
      "volume": 162600,
      "date": 1526223600,
      "close": 3695
    },
    {
      "volume": 473800,
      "date": 1526310000,
      "close": 3825
    },
    {
      "volume": 383200,
      "date": 1526396400,
      "close": 3980
    },
    {
      "volume": 440000,
      "date": 1526482800,
      "close": 4220
    },
    {
      "volume": 356600,
      "date": 1526569200,
      "close": 4210
    },
    {
      "volume": 229800,
      "date": 1526828400,
      "close": 4295
    },
    {
      "volume": 157200,
      "date": 1526914800,
      "close": 4365
    },
    {
      "volume": 253000,
      "date": 1527001200,
      "close": 4425
    },
    {
      "volume": 295200,
      "date": 1527087600,
      "close": 4345
    },
    {
      "volume": 348200,
      "date": 1527174000,
      "close": 4430
    },
    {
      "volume": 174600,
      "date": 1527433200,
      "close": 4405
    },
    {
      "volume": 188200,
      "date": 1527519600,
      "close": 4465
    },
    {
      "volume": 168200,
      "date": 1527606000,
      "close": 4440
    },
    {
      "volume": 297600,
      "date": 1527692400,
      "close": 4505
    },
    {
      "volume": 231000,
      "date": 1527778800,
      "close": 4555
    },
    {
      "volume": 170800,
      "date": 1528038000,
      "close": 4645
    },
    {
      "volume": 445000,
      "date": 1528124400,
      "close": 4415
    },
    {
      "volume": 274400,
      "date": 1528210800,
      "close": 4460
    },
    {
      "volume": 204000,
      "date": 1528297200,
      "close": 4470
    },
    {
      "volume": 218000,
      "date": 1528383600,
      "close": 4575
    },
    {
      "volume": 267200,
      "date": 1528642800,
      "close": 4595
    },
    {
      "volume": 198200,
      "date": 1528729200,
      "close": 4660
    },
    {
      "volume": 199600,
      "date": 1528815600,
      "close": 4715
    },
    {
      "volume": 174800,
      "date": 1528902000,
      "close": 4755
    },
    {
      "volume": 177200,
      "date": 1528988400,
      "close": 4830
    },
    {
      "volume": 230200,
      "date": 1529247600,
      "close": 4875
    },
    {
      "volume": 338800,
      "date": 1529334000,
      "close": 4760
    },
    {
      "volume": 165600,
      "date": 1529420400,
      "close": 4855
    },
    {
      "volume": 264800,
      "date": 1529506800,
      "close": 4965
    },
    {
      "volume": 279600,
      "date": 1529593200,
      "close": 5110
    },
    {
      "volume": 361000,
      "date": 1529852400,
      "close": 4875
    },
    {
      "volume": 269400,
      "date": 1529938800,
      "close": 4955
    },
    {
      "volume": 142000,
      "date": 1530025200,
      "close": 5045
    },
    {
      "volume": 185600,
      "date": 1530111600,
      "close": 4925
    },
    {
      "volume": 270000,
      "date": 1530198000,
      "close": 4800
    },
    {
      "volume": 478800,
      "date": 1530457200,
      "close": 4445
    },
    {
      "volume": 248200,
      "date": 1530543600,
      "close": 4445
    },
    {
      "volume": 191600,
      "date": 1530630000,
      "close": 4490
    },
    {
      "volume": 187200,
      "date": 1530716400,
      "close": 4370
    },
    {
      "volume": 176800,
      "date": 1530802800,
      "close": 4475
    },
    {
      "volume": 132000,
      "date": 1531062000,
      "close": 4600
    },
    {
      "volume": 185800,
      "date": 1531148400,
      "close": 4535
    },
    {
      "volume": 490600,
      "date": 1531234800,
      "close": 4100
    },
    {
      "volume": 448000,
      "date": 1531321200,
      "close": 4095
    },
    {
      "volume": 256000,
      "date": 1531407600,
      "close": 4215
    },
    {
      "volume": 0,
      "date": 1531666800,
      "close": 4215
    },
    {
      "volume": 301800,
      "date": 1531753200,
      "close": 4225
    },
    {
      "volume": 168800,
      "date": 1531839600,
      "close": 4230
    },
    {
      "volume": 201400,
      "date": 1531926000,
      "close": 4095
    },
    {
      "volume": 206600,
      "date": 1532012400,
      "close": 4090
    },
    {
      "volume": 236400,
      "date": 1532271600,
      "close": 3975
    },
    {
      "volume": 205200,
      "date": 1532358000,
      "close": 3955
    },
    {
      "volume": 90000,
      "date": 1532444400,
      "close": 4025
    },
    {
      "volume": 104400,
      "date": 1532530800,
      "close": 4035
    },
    {
      "volume": 98600,
      "date": 1532617200,
      "close": 3995
    },
    {
      "volume": 143000,
      "date": 1532876400,
      "close": 3910
    },
    {
      "volume": 196800,
      "date": 1532962800,
      "close": 3975
    },
    {
      "volume": 82200,
      "date": 1533049200,
      "close": 3980
    },
    {
      "volume": 138600,
      "date": 1533135600,
      "close": 3935
    },
    {
      "volume": 151200,
      "date": 1533222000,
      "close": 3980
    },
    {
      "volume": 607600,
      "date": 1533481200,
      "close": 4470
    },
    {
      "volume": 437600,
      "date": 1533567600,
      "close": 4185
    },
    {
      "volume": 318000,
      "date": 1533654000,
      "close": 3880
    },
    {
      "volume": 279200,
      "date": 1533740400,
      "close": 3825
    },
    {
      "volume": 143200,
      "date": 1533826800,
      "close": 3815
    },
    {
      "volume": 164000,
      "date": 1534086000,
      "close": 3645
    },
    {
      "volume": 103000,
      "date": 1534172400,
      "close": 3690
    },
    {
      "volume": 67400,
      "date": 1534258800,
      "close": 3650
    },
    {
      "volume": 140200,
      "date": 1534345200,
      "close": 3515
    },
    {
      "volume": 150800,
      "date": 1534431600,
      "close": 3465
    },
    {
      "volume": 112000,
      "date": 1534690800,
      "close": 3415
    },
    {
      "volume": 135600,
      "date": 1534777200,
      "close": 3485
    },
    {
      "volume": 258600,
      "date": 1534863600,
      "close": 3475
    },
    {
      "volume": 174000,
      "date": 1534950000,
      "close": 3630
    },
    {
      "volume": 144600,
      "date": 1535036400,
      "close": 3595
    },
    {
      "volume": 68800,
      "date": 1535295600,
      "close": 3690
    },
    {
      "volume": 142000,
      "date": 1535382000,
      "close": 3740
    },
    {
      "volume": 184400,
      "date": 1535468400,
      "close": 3870
    },
    {
      "volume": 117000,
      "date": 1535554800,
      "close": 3920
    },
    {
      "volume": 121600,
      "date": 1535641200,
      "close": 3850
    },
    {
      "volume": 178400,
      "date": 1535900400,
      "close": 3670
    },
    {
      "volume": 168400,
      "date": 1535986800,
      "close": 3610
    },
    {
      "volume": 161200,
      "date": 1536073200,
      "close": 3535
    },
    {
      "volume": 170400,
      "date": 1536159600,
      "close": 3445
    },
    {
      "volume": 132000,
      "date": 1536246000,
      "close": 3460
    },
    {
      "volume": 125000,
      "date": 1536505200,
      "close": 3525
    },
    {
      "volume": 145200,
      "date": 1536591600,
      "close": 3475
    },
    {
      "volume": 145400,
      "date": 1536678000,
      "close": 3420
    },
    {
      "volume": 125400,
      "date": 1536764400,
      "close": 3540
    },
    {
      "volume": 206800,
      "date": 1536850800,
      "close": 3485
    },
    {
      "volume": 0,
      "date": 1537110000,
      "close": 3485
    },
    {
      "volume": 110200,
      "date": 1537196400,
      "close": 3605
    },
    {
      "volume": 196800,
      "date": 1537282800,
      "close": 3710
    },
    {
      "volume": 137600,
      "date": 1537369200,
      "close": 3670
    },
    {
      "volume": 166600,
      "date": 1537455600,
      "close": 3680
    },
    {
      "volume": 0,
      "date": 1537714800,
      "close": 3680
    },
    {
      "volume": 201400,
      "date": 1537801200,
      "close": 3830
    },
    {
      "volume": 176600,
      "date": 1537887600,
      "close": 3860
    },
    {
      "volume": 155400,
      "date": 1537974000,
      "close": 3870
    },
    {
      "volume": 138200,
      "date": 1538060400,
      "close": 3925
    },
    {
      "volume": 165600,
      "date": 1538319600,
      "close": 3965
    },
    {
      "volume": 157400,
      "date": 1538406000,
      "close": 3945
    },
    {
      "volume": 159800,
      "date": 1538492400,
      "close": 3865
    },
    {
      "volume": 162800,
      "date": 1538578800,
      "close": 3805
    },
    {
      "volume": 154200,
      "date": 1538665200,
      "close": 3790
    },
    {
      "volume": 0,
      "date": 1538924400,
      "close": 3790
    },
    {
      "volume": 793800,
      "date": 1539010800,
      "close": 4050
    },
    {
      "volume": 484200,
      "date": 1539097200,
      "close": 4300
    },
    {
      "volume": 429400,
      "date": 1539183600,
      "close": 4305
    },
    {
      "volume": 324400,
      "date": 1539270000,
      "close": 4375
    },
    {
      "volume": 247800,
      "date": 1539529200,
      "close": 4125
    },
    {
      "volume": 209200,
      "date": 1539615600,
      "close": 4175
    },
    {
      "volume": 221000,
      "date": 1539702000,
      "close": 4240
    },
    {
      "volume": 232000,
      "date": 1539788400,
      "close": 4285
    },
    {
      "volume": 171200,
      "date": 1539874800,
      "close": 4250
    },
    {
      "volume": 140800,
      "date": 1540134000,
      "close": 4210
    },
    {
      "volume": 169200,
      "date": 1540220400,
      "close": 4175
    },
    {
      "volume": 260200,
      "date": 1540306800,
      "close": 4345
    },
    {
      "volume": 254600,
      "date": 1540393200,
      "close": 4080
    },
    {
      "volume": 250400,
      "date": 1540479600,
      "close": 4115
    },
    {
      "volume": 218800,
      "date": 1540738800,
      "close": 3935
    },
    {
      "volume": 1135000,
      "date": 1540825200,
      "close": 4110
    },
    {
      "volume": 293600,
      "date": 1540911600,
      "close": 4020
    },
    {
      "volume": 204400,
      "date": 1540998000,
      "close": 4120
    },
    {
      "volume": 398400,
      "date": 1541084400,
      "close": 4420
    },
    {
      "volume": 187600,
      "date": 1541343600,
      "close": 4280
    },
    {
      "volume": 1286000,
      "date": 1541430000,
      "close": 5030
    },
    {
      "volume": 478600,
      "date": 1541516400,
      "close": 4950
    },
    {
      "volume": 513400,
      "date": 1541602800,
      "close": 5270
    },
    {
      "volume": 351400,
      "date": 1541689200,
      "close": 5390
    },
    {
      "volume": 389400,
      "date": 1541948400,
      "close": 5370
    },
    {
      "volume": 432800,
      "date": 1542034800,
      "close": 5470
    },
    {
      "volume": 315600,
      "date": 1542121200,
      "close": 5255
    },
    {
      "volume": 284000,
      "date": 1542207600,
      "close": 5490
    },
    {
      "volume": 181200,
      "date": 1542294000,
      "close": 5475
    },
    {
      "volume": 294400,
      "date": 1542553200,
      "close": 5645
    },
    {
      "volume": 267600,
      "date": 1542639600,
      "close": 5720
    },
    {
      "volume": 329800,
      "date": 1542726000,
      "close": 5590
    },
    {
      "volume": 315600,
      "date": 1542812400,
      "close": 5585
    },
    {
      "volume": 0,
      "date": 1542898800,
      "close": 5585
    },
    {
      "volume": 217400,
      "date": 1543158000,
      "close": 5505
    },
    {
      "volume": 545800,
      "date": 1543244400,
      "close": 5300
    },
    {
      "volume": 398800,
      "date": 1543330800,
      "close": 5490
    },
    {
      "volume": 365400,
      "date": 1543417200,
      "close": 5680
    },
    {
      "volume": 592200,
      "date": 1543503600,
      "close": 5885
    },
    {
      "volume": 348000,
      "date": 1543762800,
      "close": 5790
    },
    {
      "volume": 283200,
      "date": 1543849200,
      "close": 5805
    },
    {
      "volume": 334800,
      "date": 1543935600,
      "close": 5615
    },
    {
      "volume": 275800,
      "date": 1544022000,
      "close": 5520
    },
    {
      "volume": 211400,
      "date": 1544108400,
      "close": 5680
    },
    {
      "volume": 192600,
      "date": 1544367600,
      "close": 5565
    },
    {
      "volume": 556200,
      "date": 1544454000,
      "close": 5960
    },
    {
      "volume": 421400,
      "date": 1544540400,
      "close": 6030
    },
    {
      "volume": 397600,
      "date": 1544626800,
      "close": 6275
    },
    {
      "volume": 351600,
      "date": 1544713200,
      "close": 6245
    },
    {
      "volume": 199000,
      "date": 1544972400,
      "close": 6240
    },
    {
      "volume": 247800,
      "date": 1545058800,
      "close": 6295
    },
    {
      "volume": 283600,
      "date": 1545145200,
      "close": 6140
    },
    {
      "volume": 439400,
      "date": 1545231600,
      "close": 6075
    },
    {
      "volume": 436800,
      "date": 1545318000,
      "close": 5885
    },
    {
      "volume": 0,
      "date": 1545577200,
      "close": 5885
    },
    {
      "volume": 355800,
      "date": 1545663600,
      "close": 5540
    },
    {
      "volume": 340200,
      "date": 1545750000,
      "close": 5655
    },
    {
      "volume": 450800,
      "date": 1545836400,
      "close": 6120
    },
    {
      "volume": 237800,
      "date": 1545922800,
      "close": 5875
    },
    {
      "volume": 0,
      "date": 1546182000,
      "close": 5875
    },
    {
      "volume": 0,
      "date": 1546268400,
      "close": 5875
    },
    {
      "volume": 0,
      "date": 1546354800,
      "close": 5875
    },
    {
      "volume": 0,
      "date": 1546441200,
      "close": 5875
    },
    {
      "volume": 434600,
      "date": 1546527600,
      "close": 5770
    },
    {
      "volume": 461000,
      "date": 1546786800,
      "close": 5520
    },
    {
      "volume": 339600,
      "date": 1546873200,
      "close": 5545
    },
    {
      "volume": 333400,
      "date": 1546959600,
      "close": 5540
    },
    {
      "volume": 353400,
      "date": 1547046000,
      "close": 5315
    },
    {
      "volume": 346600,
      "date": 1547132400,
      "close": 5285
    },
    {
      "volume": 0,
      "date": 1547391600,
      "close": 5285
    },
    {
      "volume": 190200,
      "date": 1547478000,
      "close": 5180
    },
    {
      "volume": 189600,
      "date": 1547564400,
      "close": 5220
    },
    {
      "volume": 224400,
      "date": 1547650800,
      "close": 5300
    },
    {
      "volume": 188800,
      "date": 1547737200,
      "close": 5315
    },
    {
      "volume": 129400,
      "date": 1547996400,
      "close": 5300
    },
    {
      "volume": 110800,
      "date": 1548082800,
      "close": 5260
    },
    {
      "volume": 113800,
      "date": 1548169200,
      "close": 5205
    },
    {
      "volume": 115600,
      "date": 1548255600,
      "close": 5165
    },
    {
      "volume": 173800,
      "date": 1548342000,
      "close": 5200
    },
    {
      "volume": 136800,
      "date": 1548601200,
      "close": 5295
    },
    {
      "volume": 228400,
      "date": 1548687600,
      "close": 5290
    },
    {
      "volume": 194400,
      "date": 1548774000,
      "close": 5175
    },
    {
      "volume": 332400,
      "date": 1548860400,
      "close": 5360
    },
    {
      "volume": 255800,
      "date": 1548946800,
      "close": 5530
    },
    {
      "volume": 298600,
      "date": 1549206000,
      "close": 5460
    },
    {
      "volume": 185400,
      "date": 1549292400,
      "close": 5560
    },
    {
      "volume": 219000,
      "date": 1549378800,
      "close": 5395
    },
    {
      "volume": 138600,
      "date": 1549465200,
      "close": 5380
    },
    {
      "volume": 425000,
      "date": 1549551600,
      "close": 5305
    },
    {
      "volume": 0,
      "date": 1549810800,
      "close": 5305
    },
    {
      "volume": 1019800,
      "date": 1549897200,
      "close": 6355
    },
    {
      "volume": 642600,
      "date": 1549983600,
      "close": 6360
    },
    {
      "volume": 447000,
      "date": 1550070000,
      "close": 6655
    },
    {
      "volume": 346600,
      "date": 1550156400,
      "close": 6670
    },
    {
      "volume": 351200,
      "date": 1550415600,
      "close": 6555
    },
    {
      "volume": 231200,
      "date": 1550502000,
      "close": 6635
    },
    {
      "volume": 394800,
      "date": 1550588400,
      "close": 6845
    },
    {
      "volume": 236000,
      "date": 1550674800,
      "close": 6845
    },
    {
      "volume": 184600,
      "date": 1550761200,
      "close": 6895
    },
    {
      "volume": 237200,
      "date": 1551020400,
      "close": 6840
    },
    {
      "volume": 176200,
      "date": 1551106800,
      "close": 6805
    },
    {
      "volume": 194400,
      "date": 1551193200,
      "close": 6775
    },
    {
      "volume": 135600,
      "date": 1551279600,
      "close": 6780
    },
    {
      "volume": 231400,
      "date": 1551366000,
      "close": 6910
    },
    {
      "volume": 231400,
      "date": 1551625200,
      "close": 7150
    },
    {
      "volume": 178000,
      "date": 1551711600,
      "close": 7155
    },
    {
      "volume": 176800,
      "date": 1551798000,
      "close": 7040
    },
    {
      "volume": 149800,
      "date": 1551884400,
      "close": 7110
    },
    {
      "volume": 179000,
      "date": 1551970800,
      "close": 7050
    },
    {
      "volume": 255200,
      "date": 1552230000,
      "close": 7250
    },
    {
      "volume": 400000,
      "date": 1552316400,
      "close": 7485
    },
    {
      "volume": 238000,
      "date": 1552402800,
      "close": 7370
    },
    {
      "volume": 182400,
      "date": 1552489200,
      "close": 7235
    },
    {
      "volume": 681000,
      "date": 1552575600,
      "close": 7195
    },
    {
      "volume": 286400,
      "date": 1552834800,
      "close": 7080
    },
    {
      "volume": 222400,
      "date": 1552921200,
      "close": 7090
    },
    {
      "volume": 178200,
      "date": 1553007600,
      "close": 7240
    },
    {
      "volume": 0,
      "date": 1553094000,
      "close": 7240
    },
    {
      "volume": 249800,
      "date": 1553180400,
      "close": 7290
    },
    {
      "volume": 145000,
      "date": 1553439600,
      "close": 7285
    },
    {
      "volume": 340000,
      "date": 1553526000,
      "close": 7490
    },
    {
      "volume": 362400,
      "date": 1553612400,
      "close": 7760
    },
    {
      "volume": 316800,
      "date": 1553698800,
      "close": 7820
    },
    {
      "volume": 429400,
      "date": 1553785200,
      "close": 8060
    },
    {
      "volume": 361200,
      "date": 1554044400,
      "close": 8065
    },
    {
      "volume": 251200,
      "date": 1554130800,
      "close": 8050
    },
    {
      "volume": 217400,
      "date": 1554217200,
      "close": 8075
    },
    {
      "volume": 321200,
      "date": 1554303600,
      "close": 8290
    },
    {
      "volume": 233800,
      "date": 1554390000,
      "close": 8265
    },
    {
      "volume": 289000,
      "date": 1554649200,
      "close": 8435
    },
    {
      "volume": 254800,
      "date": 1554735600,
      "close": 8495
    },
    {
      "volume": 269000,
      "date": 1554822000,
      "close": 8530
    },
    {
      "volume": 337000,
      "date": 1554908400,
      "close": 8700
    },
    {
      "volume": 346600,
      "date": 1554994800,
      "close": 8935
    },
    {
      "volume": 525200,
      "date": 1555254000,
      "close": 8755
    },
    {
      "volume": 385200,
      "date": 1555340400,
      "close": 8640
    },
    {
      "volume": 341000,
      "date": 1555426800,
      "close": 8775
    },
    {
      "volume": 216200,
      "date": 1555513200,
      "close": 8765
    },
    {
      "volume": 191800,
      "date": 1555599600,
      "close": 8700
    },
    {
      "volume": 138800,
      "date": 1555858800,
      "close": 8675
    },
    {
      "volume": 285800,
      "date": 1555945200,
      "close": 8805
    },
    {
      "volume": 231200,
      "date": 1556031600,
      "close": 8795
    },
    {
      "volume": 181000,
      "date": 1556118000,
      "close": 8850
    },
    {
      "volume": 228800,
      "date": 1556204400,
      "close": 8860
    },
    {
      "volume": 0,
      "date": 1556463600,
      "close": 8860
    },
    {
      "volume": 0,
      "date": 1556550000,
      "close": 8860
    },
    {
      "volume": 0,
      "date": 1556636400,
      "close": 8860
    },
    {
      "volume": 0,
      "date": 1556722800,
      "close": 8860
    },
    {
      "volume": 0,
      "date": 1556809200,
      "close": 8860
    },
    {
      "volume": 0,
      "date": 1557068400,
      "close": 8860
    },
    {
      "volume": 304400,
      "date": 1557154800,
      "close": 8980
    },
    {
      "volume": 237600,
      "date": 1557241200,
      "close": 8905
    },
    {
      "volume": 202600,
      "date": 1557327600,
      "close": 8690
    },
    {
      "volume": 341600,
      "date": 1557414000,
      "close": 8815
    },
    {
      "volume": 266000,
      "date": 1557673200,
      "close": 8695
    },
    {
      "volume": 1575000,
      "date": 1557759600,
      "close": 7485
    },
    {
      "volume": 439800,
      "date": 1557846000,
      "close": 7420
    },
    {
      "volume": 406000,
      "date": 1557932400,
      "close": 7655
    },
    {
      "volume": 487400,
      "date": 1558018800,
      "close": 8000
    },
    {
      "volume": 362400,
      "date": 1558278000,
      "close": 7695
    },
    {
      "volume": 339200,
      "date": 1558364400,
      "close": 8015
    },
    {
      "volume": 427000,
      "date": 1558450800,
      "close": 8110
    },
    {
      "volume": 285000,
      "date": 1558537200,
      "close": 8190
    },
    {
      "volume": 489200,
      "date": 1558623600,
      "close": 7735
    },
    {
      "volume": 439800,
      "date": 1558882800,
      "close": 7530
    },
    {
      "volume": 289600,
      "date": 1558969200,
      "close": 7435
    },
    {
      "volume": 297000,
      "date": 1559055600,
      "close": 7380
    },
    {
      "volume": 419400,
      "date": 1559142000,
      "close": 7050
    },
    {
      "volume": 396800,
      "date": 1559228400,
      "close": 6920
    },
    {
      "volume": 271400,
      "date": 1559487600,
      "close": 6860
    },
    {
      "volume": 229000,
      "date": 1559574000,
      "close": 6865
    },
    {
      "volume": 288800,
      "date": 1559660400,
      "close": 7140
    },
    {
      "volume": 278200,
      "date": 1559746800,
      "close": 7000
    },
    {
      "volume": 340400,
      "date": 1559833200,
      "close": 6765
    },
    {
      "volume": 216000,
      "date": 1560092400,
      "close": 6955
    },
    {
      "volume": 184600,
      "date": 1560178800,
      "close": 6925
    },
    {
      "volume": 167000,
      "date": 1560265200,
      "close": 6925
    },
    {
      "volume": 161200,
      "date": 1560351600,
      "close": 6895
    },
    {
      "volume": 202400,
      "date": 1560438000,
      "close": 6980
    },
    {
      "volume": 184200,
      "date": 1560697200,
      "close": 6820
    },
    {
      "volume": 172000,
      "date": 1560783600,
      "close": 6830
    },
    {
      "volume": 173000,
      "date": 1560870000,
      "close": 6965
    },
    {
      "volume": 233400,
      "date": 1560956400,
      "close": 7150
    },
    {
      "volume": 559800,
      "date": 1561042800,
      "close": 6680
    },
    {
      "volume": 380000,
      "date": 1561302000,
      "close": 7125
    },
    {
      "volume": 331800,
      "date": 1561388400,
      "close": 7195
    },
    {
      "volume": 339200,
      "date": 1561474800,
      "close": 6880
    },
    {
      "volume": 306600,
      "date": 1561561200,
      "close": 6795
    },
    {
      "volume": 331800,
      "date": 1561647600,
      "close": 6755
    },
    {
      "volume": 326400,
      "date": 1561906800,
      "close": 7040
    },
    {
      "volume": 324200,
      "date": 1561993200,
      "close": 7175
    },
    {
      "volume": 398000,
      "date": 1562079600,
      "close": 6895
    },
    {
      "volume": 186400,
      "date": 1562166000,
      "close": 7085
    },
    {
      "volume": 130800,
      "date": 1562252400,
      "close": 7065
    },
    {
      "volume": 208400,
      "date": 1562511600,
      "close": 6900
    },
    {
      "volume": 118600,
      "date": 1562598000,
      "close": 6870
    },
    {
      "volume": 226000,
      "date": 1562684400,
      "close": 6860
    },
    {
      "volume": 173600,
      "date": 1562770800,
      "close": 6900
    },
    {
      "volume": 164000,
      "date": 1562857200,
      "close": 6910
    },
    {
      "volume": 0,
      "date": 1563116400,
      "close": 6910
    },
    {
      "volume": 97800,
      "date": 1563202800,
      "close": 6895
    },
    {
      "volume": 306400,
      "date": 1563289200,
      "close": 7055
    },
    {
      "volume": 255800,
      "date": 1563375600,
      "close": 6850
    },
    {
      "volume": 270200,
      "date": 1563462000,
      "close": 7020
    },
    {
      "volume": 171600,
      "date": 1563721200,
      "close": 7025
    },
    {
      "volume": 448200,
      "date": 1563807600,
      "close": 7385
    },
    {
      "volume": 306200,
      "date": 1563894000,
      "close": 7400
    },
    {
      "volume": 207200,
      "date": 1563980400,
      "close": 7475
    },
    {
      "volume": 139200,
      "date": 1564066800,
      "close": 7495
    },
    {
      "volume": 110000,
      "date": 1564326000,
      "close": 7605
    },
    {
      "volume": 168600,
      "date": 1564412400,
      "close": 7720
    },
    {
      "volume": 277200,
      "date": 1564498800,
      "close": 7540
    },
    {
      "volume": 270000,
      "date": 1564585200,
      "close": 7540
    },
    {
      "volume": 315200,
      "date": 1564671600,
      "close": 7580
    },
    {
      "volume": 937800,
      "date": 1564930800,
      "close": 8200
    },
    {
      "volume": 515800,
      "date": 1565017200,
      "close": 7715
    },
    {
      "volume": 680800,
      "date": 1565103600,
      "close": 7240
    },
    {
      "volume": 554600,
      "date": 1565190000,
      "close": 7145
    },
    {
      "volume": 305000,
      "date": 1565276400,
      "close": 7260
    },
    {
      "volume": 0,
      "date": 1565535600,
      "close": 7260
    },
    {
      "volume": 276400,
      "date": 1565622000,
      "close": 7425
    },
    {
      "volume": 209200,
      "date": 1565708400,
      "close": 7590
    },
    {
      "volume": 212400,
      "date": 1565794800,
      "close": 7400
    },
    {
      "volume": 278200,
      "date": 1565881200,
      "close": 7325
    },
    {
      "volume": 185000,
      "date": 1566140400,
      "close": 7205
    },
    {
      "volume": 266200,
      "date": 1566226800,
      "close": 7470
    },
    {
      "volume": 130400,
      "date": 1566313200,
      "close": 7435
    },
    {
      "volume": 173400,
      "date": 1566399600,
      "close": 7400
    },
    {
      "volume": 179200,
      "date": 1566486000,
      "close": 7335
    },
    {
      "volume": 138200,
      "date": 1566745200,
      "close": 7265
    },
    {
      "volume": 150000,
      "date": 1566831600,
      "close": 7280
    },
    {
      "volume": 167000,
      "date": 1566918000,
      "close": 7270
    },
    {
      "volume": 558400,
      "date": 1567004400,
      "close": 7230
    },
    {
      "volume": 208000,
      "date": 1567090800,
      "close": 7335
    },
    {
      "volume": 151400,
      "date": 1567350000,
      "close": 7310
    },
    {
      "volume": 118800,
      "date": 1567436400,
      "close": 7370
    },
    {
      "volume": 229200,
      "date": 1567522800,
      "close": 7505
    },
    {
      "volume": 564200,
      "date": 1567609200,
      "close": 8045
    },
    {
      "volume": 283800,
      "date": 1567695600,
      "close": 7945
    },
    {
      "volume": 369200,
      "date": 1567954800,
      "close": 8315
    },
    {
      "volume": 273000,
      "date": 1568041200,
      "close": 8225
    },
    {
      "volume": 308200,
      "date": 1568127600,
      "close": 8105
    },
    {
      "volume": 287000,
      "date": 1568214000,
      "close": 8350
    },
    {
      "volume": 447200,
      "date": 1568300400,
      "close": 8525
    },
    {
      "volume": 0,
      "date": 1568559600,
      "close": 8525
    },
    {
      "volume": 253400,
      "date": 1568646000,
      "close": 8665
    },
    {
      "volume": 437800,
      "date": 1568732400,
      "close": 8660
    },
    {
      "volume": 319800,
      "date": 1568818800,
      "close": 8900
    },
    {
      "volume": 549800,
      "date": 1568905200,
      "close": 9045
    },
    {
      "volume": 0,
      "date": 1569164400,
      "close": 9045
    },
    {
      "volume": 378600,
      "date": 1569250800,
      "close": 9250
    },
    {
      "volume": 278200,
      "date": 1569337200,
      "close": 9270
    },
    {
      "volume": 281000,
      "date": 1569423600,
      "close": 9170
    },
    {
      "volume": 216400,
      "date": 1569510000,
      "close": 9200
    },
    {
      "volume": 387100,
      "date": 1569769200,
      "close": 9260
    },
    {
      "volume": 491600,
      "date": 1569855600,
      "close": 8750
    },
    {
      "volume": 174600,
      "date": 1569942000,
      "close": 8730
    },
    {
      "volume": 228800,
      "date": 1570028400,
      "close": 8700
    },
    {
      "volume": 213200,
      "date": 1570114800,
      "close": 8560
    },
    {
      "volume": 147800,
      "date": 1570374000,
      "close": 8470
    },
    {
      "volume": 319500,
      "date": 1570460400,
      "close": 8900
    },
    {
      "volume": 269700,
      "date": 1570546800,
      "close": 8670
    },
    {
      "volume": 166800,
      "date": 1570633200,
      "close": 8450
    },
    {
      "volume": 143100,
      "date": 1570719600,
      "close": 8540
    },
    {
      "volume": 0,
      "date": 1570978800,
      "close": 8540
    },
    {
      "volume": 190300,
      "date": 1571065200,
      "close": 8390
    },
    {
      "volume": 182600,
      "date": 1571151600,
      "close": 8460
    },
    {
      "volume": 130100,
      "date": 1571238000,
      "close": 8540
    },
    {
      "volume": 138800,
      "date": 1571324400,
      "close": 8440
    },
    {
      "volume": 323600,
      "date": 1571583600,
      "close": 7980
    },
    {
      "volume": 0,
      "date": 1571670000,
      "close": 7980
    },
    {
      "volume": 251500,
      "date": 1571756400,
      "close": 8090
    },
    {
      "volume": 95800,
      "date": 1571842800,
      "close": 8010
    },
    {
      "volume": 100500,
      "date": 1571929200,
      "close": 8080
    },
    {
      "volume": 121200,
      "date": 1572188400,
      "close": 8080
    },
    {
      "volume": 143300,
      "date": 1572274800,
      "close": 8130
    },
    {
      "volume": 250300,
      "date": 1572361200,
      "close": 8270
    },
    {
      "volume": 155000,
      "date": 1572447600,
      "close": 8310
    },
    {
      "volume": 145800,
      "date": 1572534000,
      "close": 8270
    },
    {
      "volume": 0,
      "date": 1572793200,
      "close": 8270
    },
    {
      "volume": 239000,
      "date": 1572879600,
      "close": 8380
    },
    {
      "volume": 1090500,
      "date": 1572966000,
      "close": 7870
    },
    {
      "volume": 461100,
      "date": 1573052400,
      "close": 7780
    },
    {
      "volume": 273000,
      "date": 1573138800,
      "close": 7640
    },
    {
      "volume": 167500,
      "date": 1573398000,
      "close": 7680
    },
    {
      "volume": 221200,
      "date": 1573484400,
      "close": 7680
    },
    {
      "volume": 210900,
      "date": 1573570800,
      "close": 7780
    },
    {
      "volume": 409600,
      "date": 1573657200,
      "close": 7320
    },
    {
      "volume": 163600,
      "date": 1573743600,
      "close": 7490
    },
    {
      "volume": 134200,
      "date": 1574002800,
      "close": 7470
    },
    {
      "volume": 157500,
      "date": 1574089200,
      "close": 7440
    },
    {
      "volume": 102500,
      "date": 1574175600,
      "close": 7460
    },
    {
      "volume": 164100,
      "date": 1574262000,
      "close": 7540
    },
    {
      "volume": 121500,
      "date": 1574348400,
      "close": 7490
    },
    {
      "volume": 94500,
      "date": 1574607600,
      "close": 7520
    },
    {
      "volume": 283100,
      "date": 1574694000,
      "close": 7770
    },
    {
      "volume": 238200,
      "date": 1574780400,
      "close": 7950
    },
    {
      "volume": 167900,
      "date": 1574866800,
      "close": 7870
    },
    {
      "volume": 168900,
      "date": 1574953200,
      "close": 7910
    },
    {
      "volume": 110000,
      "date": 1575212400,
      "close": 7940
    },
    {
      "volume": 128100,
      "date": 1575298800,
      "close": 7880
    },
    {
      "volume": 211500,
      "date": 1575385200,
      "close": 7590
    },
    {
      "volume": 149000,
      "date": 1575471600,
      "close": 7540
    },
    {
      "volume": 255000,
      "date": 1575558000,
      "close": 7710
    },
    {
      "volume": 469600,
      "date": 1575817200,
      "close": 8250
    },
    {
      "volume": 272000,
      "date": 1575903600,
      "close": 8360
    },
    {
      "volume": 164800,
      "date": 1575990000,
      "close": 8290
    },
    {
      "volume": 174400,
      "date": 1576076400,
      "close": 8040
    },
    {
      "volume": 195400,
      "date": 1576162800,
      "close": 7940
    },
    {
      "volume": 147200,
      "date": 1576422000,
      "close": 8080
    },
    {
      "volume": 114700,
      "date": 1576508400,
      "close": 8150
    },
    {
      "volume": 129500,
      "date": 1576594800,
      "close": 8000
    },
    {
      "volume": 98800,
      "date": 1576681200,
      "close": 7870
    },
    {
      "volume": 130200,
      "date": 1576767600,
      "close": 7950
    },
    {
      "volume": 105900,
      "date": 1577026800,
      "close": 8000
    },
    {
      "volume": 82800,
      "date": 1577113200,
      "close": 7990
    },
    {
      "volume": 76400,
      "date": 1577199600,
      "close": 7900
    },
    {
      "volume": 118300,
      "date": 1577286000,
      "close": 8070
    },
    {
      "volume": 131100,
      "date": 1577372400,
      "close": 8140
    },
    {
      "volume": 78200,
      "date": 1577631600,
      "close": 8020
    },
    {
      "volume": 0,
      "date": 1577718000,
      "close": 8020
    },
    {
      "volume": 171100,
      "date": 1578236400,
      "close": 7800
    },
    {
      "volume": 217000,
      "date": 1578322800,
      "close": 8100
    },
    {
      "volume": 231100,
      "date": 1578409200,
      "close": 7950
    },
    {
      "volume": 151300,
      "date": 1578495600,
      "close": 8090
    },
    {
      "volume": 176700,
      "date": 1578582000,
      "close": 7900
    },
    {
      "volume": 212800,
      "date": 1578927600,
      "close": 8040
    },
    {
      "volume": 101700,
      "date": 1579014000,
      "close": 7910
    },
    {
      "volume": 299300,
      "date": 1579100400,
      "close": 7640
    },
    {
      "volume": 245900,
      "date": 1579186800,
      "close": 7440
    },
    {
      "volume": 128400,
      "date": 1579446000,
      "close": 7350
    },
    {
      "volume": 163900,
      "date": 1579532400,
      "close": 7230
    },
    {
      "volume": 168900,
      "date": 1579618800,
      "close": 7200
    },
    {
      "volume": 123900,
      "date": 1579705200,
      "close": 7090
    },
    {
      "volume": 183300,
      "date": 1579791600,
      "close": 6930
    },
    {
      "volume": 221900,
      "date": 1580050800,
      "close": 6660
    },
    {
      "volume": 244400,
      "date": 1580137200,
      "close": 6710
    },
    {
      "volume": 163300,
      "date": 1580223600,
      "close": 6750
    },
    {
      "volume": 231600,
      "date": 1580310000,
      "close": 6690
    },
    {
      "volume": 190500,
      "date": 1580396400,
      "close": 6720
    },
    {
      "volume": 322200,
      "date": 1580655600,
      "close": 6540
    },
    {
      "volume": 152500,
      "date": 1580742000,
      "close": 6680
    },
    {
      "volume": 212000,
      "date": 1580828400,
      "close": 6650
    },
    {
      "volume": 245300,
      "date": 1580914800,
      "close": 6790
    },
    {
      "volume": 321800,
      "date": 1581001200,
      "close": 6650
    },
    {
      "volume": 536000,
      "date": 1581260400,
      "close": 7080
    },
    {
      "volume": 491200,
      "date": 1581433200,
      "close": 7380
    },
    {
      "volume": 243700,
      "date": 1581519600,
      "close": 7350
    },
    {
      "volume": 161900,
      "date": 1581606000,
      "close": 7310
    },
    {
      "volume": 144700,
      "date": 1581865200,
      "close": 7200
    },
    {
      "volume": 188000,
      "date": 1581951600,
      "close": 7160
    },
    {
      "volume": 171200,
      "date": 1582038000,
      "close": 7230
    },
    {
      "volume": 171100,
      "date": 1582124400,
      "close": 7170
    },
    {
      "volume": 171900,
      "date": 1582210800,
      "close": 7150
    },
    {
      "volume": 339700,
      "date": 1582556400,
      "close": 6920
    },
    {
      "volume": 285100,
      "date": 1582642800,
      "close": 6950
    },
    {
      "volume": 277400,
      "date": 1582729200,
      "close": 6910
    },
    {
      "volume": 524400,
      "date": 1582815600,
      "close": 6580
    },
    {
      "volume": 315000,
      "date": 1583074800,
      "close": 6760
    },
    {
      "volume": 209900,
      "date": 1583161200,
      "close": 6640
    },
    {
      "volume": 211300,
      "date": 1583247600,
      "close": 6820
    },
    {
      "volume": 152300,
      "date": 1583334000,
      "close": 6920
    },
    {
      "volume": 150400,
      "date": 1583420400,
      "close": 6750
    },
    {
      "volume": 392100,
      "date": 1583679600,
      "close": 6560
    },
    {
      "volume": 387400,
      "date": 1583766000,
      "close": 6630
    },
    {
      "volume": 260900,
      "date": 1583852400,
      "close": 6630
    },
    {
      "volume": 431200,
      "date": 1583938800,
      "close": 6260
    },
    {
      "volume": 425900,
      "date": 1584025200,
      "close": 5920
    },
    {
      "volume": 255900,
      "date": 1584284400,
      "close": 5990
    },
    {
      "volume": 384200,
      "date": 1584370800,
      "close": 6650
    },
    {
      "volume": 604200,
      "date": 1584457200,
      "close": 6970
    },
    {
      "volume": 723600,
      "date": 1584543600,
      "close": 6970
    },
    {
      "volume": 723300,
      "date": 1584889200,
      "close": 6440
    },
    {
      "volume": 320800,
      "date": 1584975600,
      "close": 6560
    },
    {
      "volume": 466900,
      "date": 1585062000,
      "close": 6420
    },
    {
      "volume": 492600,
      "date": 1585148400,
      "close": 6140
    },
    {
      "volume": 509800,
      "date": 1585234800,
      "close": 6070
    },
    {
      "volume": 257700,
      "date": 1585494000,
      "close": 6250
    },
    {
      "volume": 337700,
      "date": 1585580400,
      "close": 6020
    },
    {
      "volume": 266400,
      "date": 1585666800,
      "close": 5680
    },
    {
      "volume": 204200,
      "date": 1585753200,
      "close": 5600
    },
    {
      "volume": 144100,
      "date": 1585839600,
      "close": 5530
    },
    {
      "volume": 209700,
      "date": 1586098800,
      "close": 5770
    },
    {
      "volume": 348900,
      "date": 1586185200,
      "close": 5570
    },
    {
      "volume": 271600,
      "date": 1586271600,
      "close": 5600
    },
    {
      "volume": 297800,
      "date": 1586358000,
      "close": 5660
    },
    {
      "volume": 294500,
      "date": 1586444400,
      "close": 5560
    },
    {
      "volume": 174000,
      "date": 1586703600,
      "close": 5500
    },
    {
      "volume": 368900,
      "date": 1586790000,
      "close": 5420
    },
    {
      "volume": 304300,
      "date": 1586876400,
      "close": 5700
    },
    {
      "volume": 487800,
      "date": 1586962800,
      "close": 5300
    },
    {
      "volume": 644200,
      "date": 1587049200,
      "close": 5540
    },
    {
      "volume": 187700,
      "date": 1587308400,
      "close": 5720
    },
    {
      "volume": 172300,
      "date": 1587394800,
      "close": 5550
    },
    {
      "volume": 134300,
      "date": 1587481200,
      "close": 5470
    },
    {
      "volume": 107900,
      "date": 1587567600,
      "close": 5550
    },
    {
      "volume": 100600,
      "date": 1587654000,
      "close": 5480
    },
    {
      "volume": 115400,
      "date": 1587913200,
      "close": 5630
    },
    {
      "volume": 320500,
      "date": 1587999600,
      "close": 5570
    },
    {
      "volume": 199700,
      "date": 1588172400,
      "close": 5830
    },
    {
      "volume": 122300,
      "date": 1588258800,
      "close": 5680
    },
    {
      "volume": 183400,
      "date": 1588777200,
      "close": 5470
    },
    {
      "volume": 175200,
      "date": 1588863600,
      "close": 5670
    },
    {
      "volume": 157000,
      "date": 1589122800,
      "close": 5910
    },
    {
      "volume": 254800,
      "date": 1589209200,
      "close": 5700
    },
    {
      "volume": 188600,
      "date": 1589295600,
      "close": 5650
    },
    {
      "volume": 276300,
      "date": 1589382000,
      "close": 5670
    },
    {
      "volume": 568700,
      "date": 1589468400,
      "close": 5800
    },
    {
      "volume": 182100,
      "date": 1589727600,
      "close": 5660
    },
    {
      "volume": 254100,
      "date": 1589814000,
      "close": 5800
    },
    {
      "volume": 219900,
      "date": 1589900400,
      "close": 5910
    },
    {
      "volume": 189100,
      "date": 1589986800,
      "close": 5890
    },
    {
      "volume": 175700,
      "date": 1590073200,
      "close": 6020
    },
    {
      "volume": 352700,
      "date": 1590332400,
      "close": 6070
    },
    {
      "volume": 390000,
      "date": 1590418800,
      "close": 6300
    },
    {
      "volume": 215100,
      "date": 1590505200,
      "close": 6530
    },
    {
      "volume": 344800,
      "date": 1590591600,
      "close": 6850
    },
    {
      "volume": 248100,
      "date": 1590678000,
      "close": 6890
    },
    {
      "volume": 225400,
      "date": 1590937200,
      "close": 6850
    },
    {
      "volume": 189200,
      "date": 1591023600,
      "close": 6810
    },
    {
      "volume": 145400,
      "date": 1591110000,
      "close": 6860
    },
    {
      "volume": 147800,
      "date": 1591196400,
      "close": 6800
    },
    {
      "volume": 147000,
      "date": 1591282800,
      "close": 6640
    },
    {
      "volume": 174300,
      "date": 1591542000,
      "close": 6600
    },
    {
      "volume": 155000,
      "date": 1591628400,
      "close": 6690
    },
    {
      "volume": 168600,
      "date": 1591714800,
      "close": 6690
    },
    {
      "volume": 122500,
      "date": 1591801200,
      "close": 6580
    },
    {
      "volume": 204600,
      "date": 1591887600,
      "close": 6470
    },
    {
      "volume": 208200,
      "date": 1592146800,
      "close": 6190
    },
    {
      "volume": 191900,
      "date": 1592233200,
      "close": 6540
    },
    {
      "volume": 147100,
      "date": 1592319600,
      "close": 6500
    },
    {
      "volume": 87400,
      "date": 1592406000,
      "close": 6560
    },
    {
      "volume": 251000,
      "date": 1592492400,
      "close": 6720
    },
    {
      "volume": 400400,
      "date": 1592751600,
      "close": 7120
    },
    {
      "volume": 276100,
      "date": 1592838000,
      "close": 7180
    },
    {
      "volume": 162900,
      "date": 1592924400,
      "close": 7150
    },
    {
      "volume": 123900,
      "date": 1593010800,
      "close": 7130
    },
    {
      "volume": 160400,
      "date": 1593097200,
      "close": 7230
    },
    {
      "volume": 138600,
      "date": 1593356400,
      "close": 7170
    },
    {
      "volume": 179500,
      "date": 1593442800,
      "close": 7040
    },
    {
      "volume": 195500,
      "date": 1593529200,
      "close": 6790
    },
    {
      "volume": 176200,
      "date": 1593615600,
      "close": 6550
    },
    {
      "volume": 128500,
      "date": 1593702000,
      "close": 6710
    },
    {
      "volume": 186300,
      "date": 1593961200,
      "close": 6890
    },
    {
      "volume": 160500,
      "date": 1594047600,
      "close": 6880
    },
    {
      "volume": 107700,
      "date": 1594134000,
      "close": 6700
    },
    {
      "volume": 114200,
      "date": 1594220400,
      "close": 6660
    },
    {
      "volume": 111400,
      "date": 1594306800,
      "close": 6500
    },
    {
      "volume": 70500,
      "date": 1594566000,
      "close": 6620
    },
    {
      "volume": 126600,
      "date": 1594652400,
      "close": 6520
    },
    {
      "volume": 131000,
      "date": 1594738800,
      "close": 6600
    },
    {
      "volume": 129600,
      "date": 1594825200,
      "close": 6630
    },
    {
      "volume": 72200,
      "date": 1594911600,
      "close": 6650
    },
    {
      "volume": 55000,
      "date": 1595170800,
      "close": 6620
    },
    {
      "volume": 76100,
      "date": 1595257200,
      "close": 6640
    },
    {
      "volume": 82900,
      "date": 1595343600,
      "close": 6470
    },
    {
      "volume": 125900,
      "date": 1595775600,
      "close": 6610
    },
    {
      "volume": 115000,
      "date": 1595862000,
      "close": 6470
    },
    {
      "volume": 56800,
      "date": 1595948400,
      "close": 6470
    },
    {
      "volume": 95300,
      "date": 1596034800,
      "close": 6340
    },
    {
      "volume": 153900,
      "date": 1596121200,
      "close": 6270
    },
    {
      "volume": 106300,
      "date": 1596380400,
      "close": 6450
    },
    {
      "volume": 121500,
      "date": 1596466800,
      "close": 6500
    },
    {
      "volume": 112000,
      "date": 1596553200,
      "close": 6570
    },
    {
      "volume": 194800,
      "date": 1596639600,
      "close": 6370
    },
    {
      "volume": 545500,
      "date": 1596726000,
      "close": 6840
    },
    {
      "volume": 169400,
      "date": 1597071600,
      "close": 6820
    },
    {
      "volume": 206900,
      "date": 1597158000,
      "close": 6830
    },
    {
      "volume": 155100,
      "date": 1597244400,
      "close": 6980
    },
    {
      "volume": 161100,
      "date": 1597330800,
      "close": 6960
    },
    {
      "volume": 124200,
      "date": 1597590000,
      "close": 6840
    },
    {
      "volume": 414700,
      "date": 1597676400,
      "close": 7270
    },
    {
      "volume": 196800,
      "date": 1597762800,
      "close": 7270
    },
    {
      "volume": 232600,
      "date": 1597849200,
      "close": 6980
    },
    {
      "volume": 194100,
      "date": 1597935600,
      "close": 7140
    },
    {
      "volume": 201200,
      "date": 1598194800,
      "close": 7530
    },
    {
      "volume": 232800,
      "date": 1598281200,
      "close": 7670
    },
    {
      "volume": 120200,
      "date": 1598367600,
      "close": 7710
    },
    {
      "volume": 130000,
      "date": 1598454000,
      "close": 7690
    },
    {
      "volume": 171300,
      "date": 1598540400,
      "close": 7560
    },
    {
      "volume": 104100,
      "date": 1598799600,
      "close": 7650
    },
    {
      "volume": 78500,
      "date": 1598886000,
      "close": 7580
    },
    {
      "volume": 74200,
      "date": 1598972400,
      "close": 7650
    },
    {
      "volume": 115300,
      "date": 1599058800,
      "close": 7760
    },
    {
      "volume": 95000,
      "date": 1599145200,
      "close": 7660
    },
    {
      "volume": 162100,
      "date": 1599404400,
      "close": 7790
    },
    {
      "volume": 191500,
      "date": 1599490800,
      "close": 7900
    },
    {
      "volume": 119400,
      "date": 1599577200,
      "close": 7750
    },
    {
      "volume": 149800,
      "date": 1599663600,
      "close": 7580
    },
    {
      "volume": 111600,
      "date": 1599750000,
      "close": 7770
    },
    {
      "volume": 120000,
      "date": 1600009200,
      "close": 7880
    },
    {
      "volume": 71600,
      "date": 1600095600,
      "close": 7880
    },
    {
      "volume": 122900,
      "date": 1600182000,
      "close": 7740
    },
    {
      "volume": 91500,
      "date": 1600268400,
      "close": 7830
    },
    {
      "volume": 136300,
      "date": 1600354800,
      "close": 7760
    },
    {
      "volume": 110800,
      "date": 1600786800,
      "close": 7870
    },
    {
      "volume": 111700,
      "date": 1600873200,
      "close": 7840
    },
    {
      "volume": 192400,
      "date": 1600959600,
      "close": 8100
    },
    {
      "volume": 256700,
      "date": 1601218800,
      "close": 8360
    },
    {
      "volume": 145100,
      "date": 1601305200,
      "close": 8420
    },
    {
      "volume": 190900,
      "date": 1601391600,
      "close": 8340
    },
    {
      "volume": 0,
      "date": 1601478000,
      "close": 8340
    },
    {
      "volume": 151400,
      "date": 1601564400,
      "close": 8280
    },
    {
      "volume": 105600,
      "date": 1601823600,
      "close": 8230
    },
    {
      "volume": 89800,
      "date": 1601910000,
      "close": 8220
    },
    {
      "volume": 80700,
      "date": 1601996400,
      "close": 8160
    },
    {
      "volume": 72700,
      "date": 1602082800,
      "close": 8210
    },
    {
      "volume": 68200,
      "date": 1602169200,
      "close": 8280
    },
    {
      "volume": 67000,
      "date": 1602428400,
      "close": 8260
    },
    {
      "volume": 99000,
      "date": 1602514800,
      "close": 8270
    },
    {
      "volume": 113400,
      "date": 1602601200,
      "close": 8390
    },
    {
      "volume": 88400,
      "date": 1602687600,
      "close": 8230
    },
    {
      "volume": 67600,
      "date": 1602774000,
      "close": 8140
    },
    {
      "volume": 76300,
      "date": 1603033200,
      "close": 8200
    },
    {
      "volume": 131400,
      "date": 1603119600,
      "close": 8280
    },
    {
      "volume": 98000,
      "date": 1603206000,
      "close": 8310
    },
    {
      "volume": 88800,
      "date": 1603292400,
      "close": 8120
    },
    {
      "volume": 119600,
      "date": 1603378800,
      "close": 8050
    },
    {
      "volume": 71100,
      "date": 1603638000,
      "close": 7990
    },
    {
      "volume": 84800,
      "date": 1603724400,
      "close": 8000
    },
    {
      "volume": 81900,
      "date": 1603810800,
      "close": 8060
    },
    {
      "volume": 75100,
      "date": 1603897200,
      "close": 7980
    },
    {
      "volume": 121500,
      "date": 1603983600,
      "close": 7770
    },
    {
      "volume": 87400,
      "date": 1604242800,
      "close": 7810
    },
    {
      "volume": 82600,
      "date": 1604415600,
      "close": 7910
    },
    {
      "volume": 104300,
      "date": 1604502000,
      "close": 8020
    },
    {
      "volume": 955100,
      "date": 1604588400,
      "close": 7450
    },
    {
      "volume": 352300,
      "date": 1604847600,
      "close": 7260
    },
    {
      "volume": 260600,
      "date": 1604934000,
      "close": 7240
    },
    {
      "volume": 157100,
      "date": 1605020400,
      "close": 7210
    },
    {
      "volume": 144700,
      "date": 1605106800,
      "close": 7230
    },
    {
      "volume": 214400,
      "date": 1605193200,
      "close": 6940
    },
    {
      "volume": 164700,
      "date": 1605452400,
      "close": 7100
    },
    {
      "volume": 250500,
      "date": 1605538800,
      "close": 6780
    },
    {
      "volume": 207400,
      "date": 1605625200,
      "close": 6630
    },
    {
      "volume": 153800,
      "date": 1605711600,
      "close": 6720
    },
    {
      "volume": 165900,
      "date": 1605798000,
      "close": 6680
    },
    {
      "volume": 175300,
      "date": 1606143600,
      "close": 6830
    },
    {
      "volume": 160900,
      "date": 1606230000,
      "close": 6960
    },
    {
      "volume": 147500,
      "date": 1606316400,
      "close": 7100
    },
    {
      "volume": 174000,
      "date": 1606402800,
      "close": 7210
    },
    {
      "volume": 220200,
      "date": 1606662000,
      "close": 7020
    },
    {
      "volume": 176300,
      "date": 1606748400,
      "close": 7000
    },
    {
      "volume": 180700,
      "date": 1606834800,
      "close": 6940
    },
    {
      "volume": 157400,
      "date": 1606921200,
      "close": 6920
    },
    {
      "volume": 91000,
      "date": 1607007600,
      "close": 6840
    },
    {
      "volume": 177500,
      "date": 1607266800,
      "close": 6730
    },
    {
      "volume": 186400,
      "date": 1607353200,
      "close": 6820
    },
    {
      "volume": 202500,
      "date": 1607439600,
      "close": 7090
    },
    {
      "volume": 90800,
      "date": 1607526000,
      "close": 7080
    },
    {
      "volume": 117300,
      "date": 1607612400,
      "close": 7170
    },
    {
      "volume": 100800,
      "date": 1607871600,
      "close": 7160
    },
    {
      "volume": 85800,
      "date": 1607958000,
      "close": 7170
    },
    {
      "volume": 89600,
      "date": 1608044400,
      "close": 7200
    },
    {
      "volume": 88500,
      "date": 1608130800,
      "close": 7210
    },
    {
      "volume": 177600,
      "date": 1608217200,
      "close": 7250
    },
    {
      "volume": 128100,
      "date": 1608476400,
      "close": 7320
    },
    {
      "volume": 442100,
      "date": 1608562800,
      "close": 6900
    },
    {
      "volume": 295200,
      "date": 1608649200,
      "close": 6860
    },
    {
      "volume": 85100,
      "date": 1608735600,
      "close": 6830
    },
    {
      "volume": 61200,
      "date": 1608822000,
      "close": 6800
    },
    {
      "volume": 127400,
      "date": 1609081200,
      "close": 6850
    },
    {
      "volume": 142300,
      "date": 1609167600,
      "close": 6880
    },
    {
      "volume": 121300,
      "date": 1609254000,
      "close": 6810
    },
    {
      "volume": 156200,
      "date": 1609686000,
      "close": 6820
    },
    {
      "volume": 94300,
      "date": 1609772400,
      "close": 6720
    },
    {
      "volume": 63800,
      "date": 1609858800,
      "close": 6760
    },
    {
      "volume": 118100,
      "date": 1609945200,
      "close": 6760
    },
    {
      "volume": 123700,
      "date": 1610031600,
      "close": 6730
    },
    {
      "volume": 165600,
      "date": 1610377200,
      "close": 6650
    },
    {
      "volume": 173500,
      "date": 1610463600,
      "close": 6560
    },
    {
      "volume": 207400,
      "date": 1610550000,
      "close": 6540
    },
    {
      "volume": 244300,
      "date": 1610636400,
      "close": 6360
    },
    {
      "volume": 96400,
      "date": 1610895600,
      "close": 6310
    },
    {
      "volume": 172900,
      "date": 1610982000,
      "close": 6140
    },
    {
      "volume": 338600,
      "date": 1611068400,
      "close": 6150
    },
    {
      "volume": 169300,
      "date": 1611154800,
      "close": 6150
    },
    {
      "volume": 254800,
      "date": 1611241200,
      "close": 6340
    },
    {
      "volume": 165200,
      "date": 1611500400,
      "close": 6400
    },
    {
      "volume": 138600,
      "date": 1611586800,
      "close": 6400
    },
    {
      "volume": 232600,
      "date": 1611673200,
      "close": 6390
    },
    {
      "volume": 431500,
      "date": 1611759600,
      "close": 6310
    },
    {
      "volume": 112700,
      "date": 1611846000,
      "close": 6310
    },
    {
      "volume": 78400,
      "date": 1612105200,
      "close": 6310
    },
    {
      "volume": 89800,
      "date": 1612191600,
      "close": 6420
    },
    {
      "volume": 139200,
      "date": 1612278000,
      "close": 6540
    },
    {
      "volume": 185400,
      "date": 1612364400,
      "close": 6610
    },
    {
      "volume": 183900,
      "date": 1612450800,
      "close": 6710
    },
    {
      "volume": 682100,
      "date": 1612710000,
      "close": 7320
    },
    {
      "volume": 398000,
      "date": 1612796400,
      "close": 7500
    },
    {
      "volume": 291900,
      "date": 1612882800,
      "close": 7710
    },
    {
      "volume": 237900,
      "date": 1613055600,
      "close": 7630
    },
    {
      "volume": 108300,
      "date": 1613314800,
      "close": 7580
    },
    {
      "volume": 103400,
      "date": 1613401200,
      "close": 7600
    },
    {
      "volume": 95600,
      "date": 1613487600,
      "close": 7430
    },
    {
      "volume": 108000,
      "date": 1613574000,
      "close": 7410
    },
    {
      "volume": 108000,
      "date": 1613660400,
      "close": 7490
    },
    {
      "volume": 96900,
      "date": 1613919600,
      "close": 7380
    },
    {
      "volume": 91200,
      "date": 1614092400,
      "close": 7300
    },
    {
      "volume": 77900,
      "date": 1614178800,
      "close": 7300
    },
    {
      "volume": 139200,
      "date": 1614265200,
      "close": 7320
    },
    {
      "volume": 103900,
      "date": 1614524400,
      "close": 7270
    },
    {
      "volume": 181600,
      "date": 1614610800,
      "close": 7240
    },
    {
      "volume": 91200,
      "date": 1614697200,
      "close": 7170
    },
    {
      "volume": 112300,
      "date": 1614783600,
      "close": 6970
    },
    {
      "volume": 114600,
      "date": 1614870000,
      "close": 7060
    },
    {
      "volume": 93600,
      "date": 1615129200,
      "close": 6990
    },
    {
      "volume": 110700,
      "date": 1615215600,
      "close": 6900
    },
    {
      "volume": 105300,
      "date": 1615302000,
      "close": 6960
    },
    {
      "volume": 82200,
      "date": 1615388400,
      "close": 6970
    },
    {
      "volume": 103700,
      "date": 1615474800,
      "close": 7130
    },
    {
      "volume": 75900,
      "date": 1615734000,
      "close": 7210
    },
    {
      "volume": 78600,
      "date": 1615820400,
      "close": 7320
    },
    {
      "volume": 50000,
      "date": 1615906800,
      "close": 7350
    },
    {
      "volume": 81100,
      "date": 1615993200,
      "close": 7320
    },
    {
      "volume": 120000,
      "date": 1616079600,
      "close": 7420
    },
    {
      "volume": 78400,
      "date": 1616338800,
      "close": 7280
    },
    {
      "volume": 73700,
      "date": 1616425200,
      "close": 7170
    },
    {
      "volume": 83400,
      "date": 1616511600,
      "close": 6990
    },
    {
      "volume": 69500,
      "date": 1616598000,
      "close": 7110
    },
    {
      "volume": 80000,
      "date": 1616684400,
      "close": 7230
    },
    {
      "volume": 106700,
      "date": 1616943600,
      "close": 7250
    },
    {
      "volume": 81400,
      "date": 1617030000,
      "close": 7040
    },
    {
      "volume": 101500,
      "date": 1617116400,
      "close": 7080
    },
    {
      "volume": 75700,
      "date": 1617202800,
      "close": 6970
    },
    {
      "volume": 75100,
      "date": 1617289200,
      "close": 7020
    },
    {
      "volume": 54600,
      "date": 1617548400,
      "close": 7030
    },
    {
      "volume": 78800,
      "date": 1617634800,
      "close": 6940
    },
    {
      "volume": 62100,
      "date": 1617721200,
      "close": 7060
    },
    {
      "volume": 72700,
      "date": 1617807600,
      "close": 6860
    },
    {
      "volume": 68300,
      "date": 1617894000,
      "close": 6950
    },
    {
      "volume": 33300,
      "date": 1618153200,
      "close": 6910
    },
    {
      "volume": 50900,
      "date": 1618239600,
      "close": 6930
    },
    {
      "volume": 67300,
      "date": 1618326000,
      "close": 6860
    },
    {
      "volume": 43800,
      "date": 1618412400,
      "close": 6850
    },
    {
      "volume": 67900,
      "date": 1618498800,
      "close": 6990
    },
    {
      "volume": 29000,
      "date": 1618758000,
      "close": 6980
    },
    {
      "volume": 72100,
      "date": 1618844400,
      "close": 6840
    },
    {
      "volume": 83700,
      "date": 1618930800,
      "close": 6660
    },
    {
      "volume": 43600,
      "date": 1619017200,
      "close": 6730
    },
    {
      "volume": 53800,
      "date": 1619103600,
      "close": 6740
    },
    {
      "volume": 60100,
      "date": 1619362800,
      "close": 6700
    },
    {
      "volume": 46400,
      "date": 1619449200,
      "close": 6630
    },
    {
      "volume": 71000,
      "date": 1619535600,
      "close": 6520
    },
    {
      "volume": 71800,
      "date": 1619708400,
      "close": 6530
    },
    {
      "volume": 71200,
      "date": 1620226800,
      "close": 6620
    },
    {
      "volume": 58000,
      "date": 1620313200,
      "close": 6690
    },
    {
      "volume": 53600,
      "date": 1620572400,
      "close": 6750
    },
    {
      "volume": 158800,
      "date": 1620658800,
      "close": 6450
    },
    {
      "volume": 133000,
      "date": 1620745200,
      "close": 6400
    },
    {
      "volume": 89200,
      "date": 1620831600,
      "close": 6180
    },
    {
      "volume": 261700,
      "date": 1620918000,
      "close": 6140
    },
    {
      "volume": 138600,
      "date": 1621177200,
      "close": 6050
    },
    {
      "volume": 91000,
      "date": 1621263600,
      "close": 6100
    },
    {
      "volume": 131000,
      "date": 1621350000,
      "close": 5990
    },
    {
      "volume": 87200,
      "date": 1621436400,
      "close": 6080
    },
    {
      "volume": 68400,
      "date": 1621522800,
      "close": 6140
    },
    {
      "volume": 136800,
      "date": 1621782000,
      "close": 6190
    },
    {
      "volume": 77600,
      "date": 1621868400,
      "close": 6230
    },
    {
      "volume": 94800,
      "date": 1621954800,
      "close": 6160
    },
    {
      "volume": 221700,
      "date": 1622041200,
      "close": 6140
    },
    {
      "volume": 107300,
      "date": 1622127600,
      "close": 6120
    },
    {
      "volume": 102600,
      "date": 1622386800,
      "close": 6050
    },
    {
      "volume": 80300,
      "date": 1622473200,
      "close": 6100
    },
    {
      "volume": 96000,
      "date": 1622559600,
      "close": 6160
    },
    {
      "volume": 125900,
      "date": 1622646000,
      "close": 6340
    },
    {
      "volume": 186800,
      "date": 1622732400,
      "close": 6590
    },
    {
      "volume": 101600,
      "date": 1622991600,
      "close": 6610
    },
    {
      "volume": 112400,
      "date": 1623078000,
      "close": 6780
    },
    {
      "volume": 93100,
      "date": 1623164400,
      "close": 6660
    },
    {
      "volume": 108600,
      "date": 1623250800,
      "close": 6640
    },
    {
      "volume": 124200,
      "date": 1623337200,
      "close": 6690
    },
    {
      "volume": 71800,
      "date": 1623596400,
      "close": 6740
    },
    {
      "volume": 99300,
      "date": 1623682800,
      "close": 6640
    },
    {
      "volume": 54400,
      "date": 1623769200,
      "close": 6710
    },
    {
      "volume": 64900,
      "date": 1623855600,
      "close": 6600
    },
    {
      "volume": 68600,
      "date": 1623942000,
      "close": 6470
    },
    {
      "volume": 71700,
      "date": 1624201200,
      "close": 6370
    },
    {
      "volume": 90800,
      "date": 1624287600,
      "close": 6540
    },
    {
      "volume": 61100,
      "date": 1624374000,
      "close": 6430
    },
    {
      "volume": 63600,
      "date": 1624460400,
      "close": 6500
    },
    {
      "volume": 55900,
      "date": 1624546800,
      "close": 6560
    },
    {
      "volume": 47900,
      "date": 1624806000,
      "close": 6660
    },
    {
      "volume": 65100,
      "date": 1624892400,
      "close": 6610
    },
    {
      "volume": 62900,
      "date": 1624978800,
      "close": 6530
    },
    {
      "volume": 61100,
      "date": 1625065200,
      "close": 6500
    },
    {
      "volume": 92500,
      "date": 1625151600,
      "close": 6460
    },
    {
      "volume": 136300,
      "date": 1625410800,
      "close": 6280
    },
    {
      "volume": 79600,
      "date": 1625497200,
      "close": 6320
    },
    {
      "volume": 69300,
      "date": 1625583600,
      "close": 6260
    },
    {
      "volume": 89800,
      "date": 1625670000,
      "close": 6200
    },
    {
      "volume": 140200,
      "date": 1625756400,
      "close": 6150
    },
    {
      "volume": 73400,
      "date": 1626015600,
      "close": 6300
    },
    {
      "volume": 54100,
      "date": 1626102000,
      "close": 6340
    },
    {
      "volume": 75500,
      "date": 1626188400,
      "close": 6400
    },
    {
      "volume": 94100,
      "date": 1626274800,
      "close": 6450
    },
    {
      "volume": 82300,
      "date": 1626361200,
      "close": 6440
    },
    {
      "volume": 128100,
      "date": 1626620400,
      "close": 6420
    },
    {
      "volume": 217600,
      "date": 1626706800,
      "close": 6620
    },
    {
      "volume": 215900,
      "date": 1626793200,
      "close": 6890
    },
    {
      "volume": 194100,
      "date": 1627225200,
      "close": 7070
    },
    {
      "volume": 115200,
      "date": 1627311600,
      "close": 7070
    },
    {
      "volume": 149500,
      "date": 1627398000,
      "close": 7030
    },
    {
      "volume": 78500,
      "date": 1627484400,
      "close": 6940
    },
    {
      "volume": 103300,
      "date": 1627570800,
      "close": 6830
    },
    {
      "volume": 100700,
      "date": 1627830000,
      "close": 6840
    },
    {
      "volume": 41100,
      "date": 1627916400,
      "close": 6790
    },
    {
      "volume": 49400,
      "date": 1628002800,
      "close": 6810
    },
    {
      "volume": 65000,
      "date": 1628089200,
      "close": 6860
    },
    {
      "volume": 81300,
      "date": 1628175600,
      "close": 6990
    },
    {
      "volume": 146200,
      "date": 1628521200,
      "close": 7030
    },
    {
      "volume": 180700,
      "date": 1628607600,
      "close": 7100
    },
    {
      "volume": 248500,
      "date": 1628694000,
      "close": 6920
    },
    {
      "volume": 202000,
      "date": 1628780400,
      "close": 6740
    },
    {
      "volume": 131000,
      "date": 1629039600,
      "close": 6520
    },
    {
      "volume": 122800,
      "date": 1629126000,
      "close": 6350
    },
    {
      "volume": 65600,
      "date": 1629212400,
      "close": 6460
    },
    {
      "volume": 71800,
      "date": 1629298800,
      "close": 6540
    },
    {
      "volume": 69600,
      "date": 1629385200,
      "close": 6410
    },
    {
      "volume": 59300,
      "date": 1629644400,
      "close": 6380
    },
    {
      "volume": 54800,
      "date": 1629730800,
      "close": 6410
    },
    {
      "volume": 79300,
      "date": 1629817200,
      "close": 6340
    },
    {
      "volume": 58700,
      "date": 1629903600,
      "close": 6390
    },
    {
      "volume": 57500,
      "date": 1629990000,
      "close": 6470
    },
    {
      "volume": 84500,
      "date": 1630249200,
      "close": 6550
    },
    {
      "volume": 121200,
      "date": 1630335600,
      "close": 6730
    },
    {
      "volume": 86900,
      "date": 1630422000,
      "close": 6870
    },
    {
      "volume": 123600,
      "date": 1630508400,
      "close": 6890
    },
    {
      "volume": 121900,
      "date": 1630594800,
      "close": 7030
    },
    {
      "volume": 98200,
      "date": 1630854000,
      "close": 7070
    },
    {
      "volume": 91900,
      "date": 1630940400,
      "close": 7080
    },
    {
      "volume": 66300,
      "date": 1631026800,
      "close": 7080
    },
    {
      "volume": 126100,
      "date": 1631113200,
      "close": 7160
    },
    {
      "volume": 193300,
      "date": 1631199600,
      "close": 7320
    },
    {
      "volume": 83000,
      "date": 1631458800,
      "close": 7370
    },
    {
      "volume": 88000,
      "date": 1631545200,
      "close": 7450
    },
    {
      "volume": 99300,
      "date": 1631631600,
      "close": 7350
    },
    {
      "volume": 82400,
      "date": 1631718000,
      "close": 7380
    },
    {
      "volume": 103900,
      "date": 1631804400,
      "close": 7480
    },
    {
      "volume": 68800,
      "date": 1632150000,
      "close": 7330
    },
    {
      "volume": 63400,
      "date": 1632236400,
      "close": 7210
    },
    {
      "volume": 94000,
      "date": 1632409200,
      "close": 7480
    },
    {
      "volume": 83100,
      "date": 1632668400,
      "close": 7270
    },
    {
      "volume": 80900,
      "date": 1632754800,
      "close": 7160
    },
    {
      "volume": 113800,
      "date": 1632841200,
      "close": 7130
    },
    {
      "volume": 77400,
      "date": 1632927600,
      "close": 7290
    },
    {
      "volume": 80400,
      "date": 1633014000,
      "close": 7070
    },
    {
      "volume": 53700,
      "date": 1633273200,
      "close": 7180
    },
    {
      "volume": 92300,
      "date": 1633359600,
      "close": 6890
    },
    {
      "volume": 100000,
      "date": 1633446000,
      "close": 6730
    },
    {
      "volume": 105700,
      "date": 1633532400,
      "close": 6610
    },
    {
      "volume": 115700,
      "date": 1633618800,
      "close": 6690
    },
    {
      "volume": 67000,
      "date": 1633878000,
      "close": 6860
    },
    {
      "volume": 64000,
      "date": 1633964400,
      "close": 6750
    },
    {
      "volume": 74600,
      "date": 1634050800,
      "close": 6840
    },
    {
      "volume": 71300,
      "date": 1634137200,
      "close": 6830
    },
    {
      "volume": 93000,
      "date": 1634223600,
      "close": 6920
    },
    {
      "volume": 99500,
      "date": 1634482800,
      "close": 6870
    },
    {
      "volume": 52400,
      "date": 1634569200,
      "close": 6920
    },
    {
      "volume": 65600,
      "date": 1634655600,
      "close": 6860
    },
    {
      "volume": 90500,
      "date": 1634742000,
      "close": 6620
    },
    {
      "volume": 92300,
      "date": 1634828400,
      "close": 6560
    },
    {
      "volume": 73800,
      "date": 1635087600,
      "close": 6540
    },
    {
      "volume": 86400,
      "date": 1635174000,
      "close": 6680
    },
    {
      "volume": 83400,
      "date": 1635260400,
      "close": 6630
    },
    {
      "volume": 467500,
      "date": 1635346800,
      "close": 6760
    },
    {
      "volume": 117200,
      "date": 1635433200,
      "close": 6870
    },
    {
      "volume": 106900,
      "date": 1635692400,
      "close": 7150
    },
    {
      "volume": 96900,
      "date": 1635778800,
      "close": 7180
    },
    {
      "volume": 124900,
      "date": 1635951600,
      "close": 7420
    },
    {
      "volume": 252700,
      "date": 1636038000,
      "close": 7500
    },
    {
      "volume": 162300,
      "date": 1636297200,
      "close": 7270
    },
    {
      "volume": 72800,
      "date": 1636383600,
      "close": 7370
    },
    {
      "volume": 97900,
      "date": 1636470000,
      "close": 7200
    },
    {
      "volume": 72900,
      "date": 1636556400,
      "close": 7120
    },
    {
      "volume": 61900,
      "date": 1636642800,
      "close": 7140
    },
    {
      "volume": 43100,
      "date": 1636902000,
      "close": 7140
    },
    {
      "volume": 68400,
      "date": 1636988400,
      "close": 7330
    },
    {
      "volume": 49300,
      "date": 1637074800,
      "close": 7180
    },
    {
      "volume": 55700,
      "date": 1637161200,
      "close": 7140
    },
    {
      "volume": 67300,
      "date": 1637247600,
      "close": 7110
    },
    {
      "volume": 50900,
      "date": 1637506800,
      "close": 7030
    },
    {
      "volume": 84200,
      "date": 1637679600,
      "close": 6910
    },
    {
      "volume": 36200,
      "date": 1637766000,
      "close": 6850
    },
    {
      "volume": 69500,
      "date": 1637852400,
      "close": 6670
    },
    {
      "volume": 90200,
      "date": 1638111600,
      "close": 6490
    },
    {
      "volume": 128000,
      "date": 1638198000,
      "close": 6450
    },
    {
      "volume": 118700,
      "date": 1638284400,
      "close": 6420
    },
    {
      "volume": 127500,
      "date": 1638370800,
      "close": 6330
    },
    {
      "volume": 74900,
      "date": 1638457200,
      "close": 6550
    },
    {
      "volume": 74700,
      "date": 1638716400,
      "close": 6550
    },
    {
      "volume": 74100,
      "date": 1638802800,
      "close": 6750
    },
    {
      "volume": 87300,
      "date": 1638889200,
      "close": 6710
    },
    {
      "volume": 175200,
      "date": 1638975600,
      "close": 6510
    },
    {
      "volume": 76000,
      "date": 1639062000,
      "close": 6500
    },
    {
      "volume": 47100,
      "date": 1639321200,
      "close": 6490
    },
    {
      "volume": 50700,
      "date": 1639407600,
      "close": 6490
    },
    {
      "volume": 74700,
      "date": 1639494000,
      "close": 6410
    },
    {
      "volume": 102900,
      "date": 1639580400,
      "close": 6550
    },
    {
      "volume": 103000,
      "date": 1639666800,
      "close": 6370
    },
    {
      "volume": 67400,
      "date": 1639926000,
      "close": 6370
    },
    {
      "volume": 81900,
      "date": 1640012400,
      "close": 6530
    },
    {
      "volume": 64900,
      "date": 1640098800,
      "close": 6620
    },
    {
      "volume": 69400,
      "date": 1640185200,
      "close": 6650
    },
    {
      "volume": 49400,
      "date": 1640271600,
      "close": 6680
    },
    {
      "volume": 39700,
      "date": 1640530800,
      "close": 6610
    },
    {
      "volume": 87000,
      "date": 1640617200,
      "close": 6720
    },
    {
      "volume": 52100,
      "date": 1640703600,
      "close": 6710
    },
    {
      "volume": 32400,
      "date": 1640790000,
      "close": 6660
    },
    {
      "volume": 50400,
      "date": 1641222000,
      "close": 6680
    },
    {
      "volume": 60800,
      "date": 1641308400,
      "close": 6670
    },
    {
      "volume": 68900,
      "date": 1641394800,
      "close": 6410
    },
    {
      "volume": 96900,
      "date": 1641481200,
      "close": 6430
    },
    {
      "volume": 83700,
      "date": 1641826800,
      "close": 6360
    },
    {
      "volume": 75100,
      "date": 1641913200,
      "close": 6500
    },
    {
      "volume": 220300,
      "date": 1641999600,
      "close": 6110
    },
    {
      "volume": 153400,
      "date": 1642086000,
      "close": 6290
    },
    {
      "volume": 74400,
      "date": 1642345200,
      "close": 6300
    },
    {
      "volume": 68000,
      "date": 1642431600,
      "close": 6260
    },
    {
      "volume": 116200,
      "date": 1642518000,
      "close": 6020
    },
    {
      "volume": 85800,
      "date": 1642604400,
      "close": 6130
    },
    {
      "volume": 111300,
      "date": 1642690800,
      "close": 5950
    },
    {
      "volume": 88300,
      "date": 1642950000,
      "close": 6110
    },
    {
      "volume": 63900,
      "date": 1643036400,
      "close": 6060
    },
    {
      "volume": 67700,
      "date": 1643122800,
      "close": 5980
    },
    {
      "volume": 136900,
      "date": 1643209200,
      "close": 5790
    },
    {
      "volume": 59900,
      "date": 1643295600,
      "close": 5890
    },
    {
      "volume": 49300,
      "date": 1643554800,
      "close": 5930
    },
    {
      "volume": 83900,
      "date": 1643641200,
      "close": 5810
    },
    {
      "volume": 136300,
      "date": 1643727600,
      "close": 6140
    },
    {
      "volume": 66800,
      "date": 1643814000,
      "close": 6170
    },
    {
      "volume": 73600,
      "date": 1643900400,
      "close": 6070
    },
    {
      "volume": 105900,
      "date": 1644159600,
      "close": 6090
    },
    {
      "volume": 104800,
      "date": 1644246000,
      "close": 6080
    },
    {
      "volume": 321200,
      "date": 1644332400,
      "close": 6230
    },
    {
      "volume": 109000,
      "date": 1644418800,
      "close": 6300
    },
    {
      "volume": 121800,
      "date": 1644764400,
      "close": 6350
    },
    {
      "volume": 94300,
      "date": 1644850800,
      "close": 6350
    },
    {
      "volume": 135700,
      "date": 1644937200,
      "close": 6240
    },
    {
      "volume": 104400,
      "date": 1645023600,
      "close": 6150
    },
    {
      "volume": 131500,
      "date": 1645110000,
      "close": 6080
    },
    {
      "volume": 194600,
      "date": 1645369200,
      "close": 5990
    },
    {
      "volume": 197900,
      "date": 1645455600,
      "close": 5970
    },
    {
      "volume": 115500,
      "date": 1645628400,
      "close": 5900
    },
    {
      "volume": 115500,
      "date": 1645714800,
      "close": 6060
    },
    {
      "volume": 99200,
      "date": 1645974000,
      "close": 6050
    },
    {
      "volume": 81900,
      "date": 1646060400,
      "close": 6150
    },
    {
      "volume": 72900,
      "date": 1646146800,
      "close": 6040
    },
    {
      "volume": 78600,
      "date": 1646233200,
      "close": 6000
    },
    {
      "volume": 93800,
      "date": 1646319600,
      "close": 5880
    },
    {
      "volume": 130900,
      "date": 1646578800,
      "close": 5710
    },
    {
      "volume": 139900,
      "date": 1646665200,
      "close": 5710
    },
    {
      "volume": 89300,
      "date": 1646751600,
      "close": 5780
    },
    {
      "volume": 84500,
      "date": 1646838000,
      "close": 5990
    },
    {
      "volume": 92900,
      "date": 1646924400,
      "close": 5890
    },
    {
      "volume": 67400,
      "date": 1647183600,
      "close": 5830
    },
    {
      "volume": 92000,
      "date": 1647270000,
      "close": 6010
    },
    {
      "volume": 187200,
      "date": 1647356400,
      "close": 5890
    },
    {
      "volume": 160000,
      "date": 1647442800,
      "close": 6130
    },
    {
      "volume": 128900,
      "date": 1647529200,
      "close": 6100
    },
    {
      "volume": 243700,
      "date": 1647874800,
      "close": 6040
    },
    {
      "volume": 204900,
      "date": 1647961200,
      "close": 6300
    },
    {
      "volume": 90300,
      "date": 1648047600,
      "close": 6350
    },
    {
      "volume": 101500,
      "date": 1648134000,
      "close": 6390
    },
    {
      "volume": 61200,
      "date": 1648393200,
      "close": 6340
    },
    {
      "volume": 103300,
      "date": 1648479600,
      "close": 6410
    },
    {
      "volume": 82100,
      "date": 1648566000,
      "close": 6380
    },
    {
      "volume": 69900,
      "date": 1648652400,
      "close": 6210
    },
    {
      "volume": 64400,
      "date": 1648738800,
      "close": 6220
    },
    {
      "volume": 45100,
      "date": 1648998000,
      "close": 6340
    },
    {
      "volume": 63900,
      "date": 1649084400,
      "close": 6380
    },
    {
      "volume": 59600,
      "date": 1649170800,
      "close": 6260
    },
    {
      "volume": 56000,
      "date": 1649257200,
      "close": 6200
    },
    {
      "volume": 60700,
      "date": 1649343600,
      "close": 6170
    },
    {
      "volume": 54400,
      "date": 1649602800,
      "close": 6090
    },
    {
      "volume": 81600,
      "date": 1649689200,
      "close": 5920
    },
    {
      "volume": 68700,
      "date": 1649775600,
      "close": 6110
    },
    {
      "volume": 41900,
      "date": 1649862000,
      "close": 6120
    },
    {
      "volume": 43600,
      "date": 1649948400,
      "close": 6100
    },
    {
      "volume": 44600,
      "date": 1650207600,
      "close": 6040
    },
    {
      "volume": 47600,
      "date": 1650294000,
      "close": 6040
    },
    {
      "volume": 69900,
      "date": 1650380400,
      "close": 6250
    },
    {
      "volume": 55300,
      "date": 1650466800,
      "close": 6270
    },
    {
      "volume": 47500,
      "date": 1650553200,
      "close": 6200
    },
    {
      "volume": 64200,
      "date": 1650812400,
      "close": 6150
    },
    {
      "volume": 55700,
      "date": 1650898800,
      "close": 6210
    },
    {
      "volume": 153200,
      "date": 1650985200,
      "close": 6370
    },
    {
      "volume": 103200,
      "date": 1651071600,
      "close": 6550
    },
    {
      "volume": 77700,
      "date": 1651417200,
      "close": 6470
    },
    {
      "volume": 72000,
      "date": 1651762800,
      "close": 6470
    },
    {
      "volume": 80800,
      "date": 1652022000,
      "close": 6360
    },
    {
      "volume": 69600,
      "date": 1652108400,
      "close": 6370
    },
    {
      "volume": 74800,
      "date": 1652194800,
      "close": 6390
    },
    {
      "volume": 85300,
      "date": 1652281200,
      "close": 6400
    },
    {
      "volume": 205900,
      "date": 1652367600,
      "close": 6790
    },
    {
      "volume": 148700,
      "date": 1652626800,
      "close": 6930
    },
    {
      "volume": 109500,
      "date": 1652713200,
      "close": 7100
    },
    {
      "volume": 124200,
      "date": 1652799600,
      "close": 7170
    },
    {
      "volume": 98300,
      "date": 1652886000,
      "close": 7160
    },
    {
      "volume": 267600,
      "date": 1652972400,
      "close": 7630
    },
    {
      "volume": 252600,
      "date": 1653231600,
      "close": 7830
    },
    {
      "volume": 175300,
      "date": 1653318000,
      "close": 7590
    },
    {
      "volume": 115500,
      "date": 1653404400,
      "close": 7660
    },
    {
      "volume": 116900,
      "date": 1653490800,
      "close": 7770
    },
    {
      "volume": 163300,
      "date": 1653577200,
      "close": 7870
    },
    {
      "volume": 166200,
      "date": 1653836400,
      "close": 7870
    },
    {
      "volume": 169500,
      "date": 1653922800,
      "close": 7920
    },
    {
      "volume": 119100,
      "date": 1654009200,
      "close": 8040
    },
    {
      "volume": 159100,
      "date": 1654095600,
      "close": 8160
    },
    {
      "volume": 125900,
      "date": 1654182000,
      "close": 8280
    },
    {
      "volume": 88600,
      "date": 1654441200,
      "close": 8260
    },
    {
      "volume": 114400,
      "date": 1654527600,
      "close": 8330
    },
    {
      "volume": 115000,
      "date": 1654614000,
      "close": 8460
    },
    {
      "volume": 150900,
      "date": 1654700400,
      "close": 8520
    },
    {
      "volume": 368700,
      "date": 1654786800,
      "close": 8390
    },
    {
      "volume": 131000,
      "date": 1655046000,
      "close": 8320
    },
    {
      "volume": 197900,
      "date": 1655132400,
      "close": 8100
    },
    {
      "volume": 184800,
      "date": 1655218800,
      "close": 7790
    },
    {
      "volume": 141700,
      "date": 1655305200,
      "close": 7770
    },
    {
      "volume": 146000,
      "date": 1655391600,
      "close": 7650
    },
    {
      "volume": 91300,
      "date": 1655650800,
      "close": 7520
    },
    {
      "volume": 120100,
      "date": 1655737200,
      "close": 7710
    },
    {
      "volume": 59700,
      "date": 1655823600,
      "close": 7540
    },
    {
      "volume": 61100,
      "date": 1655910000,
      "close": 7470
    },
    {
      "volume": 70400,
      "date": 1655996400,
      "close": 7560
    },
    {
      "volume": 64300,
      "date": 1656255600,
      "close": 7610
    },
    {
      "volume": 95200,
      "date": 1656342000,
      "close": 7570
    },
    {
      "volume": 135100,
      "date": 1656428400,
      "close": 7550
    },
    {
      "volume": 171200,
      "date": 1656514800,
      "close": 7620
    },
    {
      "volume": 159900,
      "date": 1656601200,
      "close": 7650
    },
    {
      "volume": 52700,
      "date": 1656860400,
      "close": 7680
    },
    {
      "volume": 57900,
      "date": 1656946800,
      "close": 7750
    },
    {
      "volume": 74500,
      "date": 1657033200,
      "close": 7760
    },
    {
      "volume": 57600,
      "date": 1657119600,
      "close": 7830
    },
    {
      "volume": 91200,
      "date": 1657206000,
      "close": 7810
    },
    {
      "volume": 125000,
      "date": 1657465200,
      "close": 8000
    },
    {
      "volume": 85200,
      "date": 1657551600,
      "close": 7790
    },
    {
      "volume": 90600,
      "date": 1657638000,
      "close": 7860
    },
    {
      "volume": 63500,
      "date": 1657724400,
      "close": 7870
    },
    {
      "volume": 69600,
      "date": 1657810800,
      "close": 7930
    },
    {
      "volume": 65400,
      "date": 1658156400,
      "close": 8010
    },
    {
      "volume": 89300,
      "date": 1658242800,
      "close": 8190
    },
    {
      "volume": 86400,
      "date": 1658329200,
      "close": 8340
    },
    {
      "volume": 66900,
      "date": 1658415600,
      "close": 8420
    },
    {
      "volume": 50900,
      "date": 1658674800,
      "close": 8300
    },
    {
      "volume": 48000,
      "date": 1658761200,
      "close": 8360
    },
    {
      "volume": 57100,
      "date": 1658847600,
      "close": 8270
    },
    {
      "volume": 81900,
      "date": 1658934000,
      "close": 8260
    },
    {
      "volume": 79600,
      "date": 1659020400,
      "close": 8280
    },
    {
      "volume": 109400,
      "date": 1659279600,
      "close": 8490
    },
    {
      "volume": 90000,
      "date": 1659366000,
      "close": 8230
    },
    {
      "volume": 90400,
      "date": 1659452400,
      "close": 8060
    },
    {
      "volume": 78300,
      "date": 1659538800,
      "close": 8210
    },
    {
      "volume": 110900,
      "date": 1659625200,
      "close": 8130
    },
    {
      "volume": 213200,
      "date": 1659884400,
      "close": 8190
    },
    {
      "volume": 117000,
      "date": 1659970800,
      "close": 8230
    },
    {
      "volume": 129600,
      "date": 1660057200,
      "close": 7870
    },
    {
      "volume": 88200,
      "date": 1660230000,
      "close": 7990
    },
    {
      "volume": 50000,
      "date": 1660489200,
      "close": 7910
    },
    {
      "volume": 51500,
      "date": 1660575600,
      "close": 8040
    },
    {
      "volume": 196300,
      "date": 1660662000,
      "close": 8630
    },
    {
      "volume": 143100,
      "date": 1660748400,
      "close": 8840
    },
    {
      "volume": 70700,
      "date": 1660834800,
      "close": 8780
    },
    {
      "volume": 48100,
      "date": 1661094000,
      "close": 8690
    },
    {
      "volume": 67600,
      "date": 1661180400,
      "close": 8600
    },
    {
      "volume": 39600,
      "date": 1661266800,
      "close": 8530
    },
    {
      "volume": 34200,
      "date": 1661353200,
      "close": 8550
    },
    {
      "volume": 42200,
      "date": 1661439600,
      "close": 8490
    },
    {
      "volume": 84800,
      "date": 1661698800,
      "close": 8330
    },
    {
      "volume": 48800,
      "date": 1661785200,
      "close": 8370
    },
    {
      "volume": 86700,
      "date": 1661871600,
      "close": 8330
    },
    {
      "volume": 79200,
      "date": 1661958000,
      "close": 8130
    },
    {
      "volume": 87700,
      "date": 1662044400,
      "close": 7870
    },
    {
      "volume": 74900,
      "date": 1662303600,
      "close": 7780
    },
    {
      "volume": 47000,
      "date": 1662390000,
      "close": 7730
    },
    {
      "volume": 69600,
      "date": 1662476400,
      "close": 7680
    },
    {
      "volume": 75400,
      "date": 1662562800,
      "close": 7860
    },
    {
      "volume": 71200,
      "date": 1662649200,
      "close": 7830
    },
    {
      "volume": 66800,
      "date": 1662908400,
      "close": 7940
    },
    {
      "volume": 73600,
      "date": 1662994800,
      "close": 8030
    },
    {
      "volume": 102400,
      "date": 1663081200,
      "close": 7940
    },
    {
      "volume": 41900,
      "date": 1663167600,
      "close": 7980
    },
    {
      "volume": 89600,
      "date": 1663254000,
      "close": 8010
    },
    {
      "volume": 74900,
      "date": 1663599600,
      "close": 8160
    },
    {
      "volume": 79800,
      "date": 1663686000,
      "close": 8170
    },
    {
      "volume": 84400,
      "date": 1663772400,
      "close": 7880
    },
    {
      "volume": 102800,
      "date": 1664118000,
      "close": 7640
    },
    {
      "volume": 69000,
      "date": 1664204400,
      "close": 7630
    },
    {
      "volume": 94800,
      "date": 1664290800,
      "close": 7750
    },
    {
      "volume": 106800,
      "date": 1664377200,
      "close": 7910
    },
    {
      "volume": 91200,
      "date": 1664463600,
      "close": 7660
    },
    {
      "volume": 99900,
      "date": 1664722800,
      "close": 7690
    },
    {
      "volume": 105400,
      "date": 1664809200,
      "close": 7820
    },
    {
      "volume": 95900,
      "date": 1664895600,
      "close": 7900
    },
    {
      "volume": 75900,
      "date": 1664982000,
      "close": 7900
    },
    {
      "volume": 61700,
      "date": 1665068400,
      "close": 7810
    },
    {
      "volume": 99800,
      "date": 1665414000,
      "close": 7570
    },
    {
      "volume": 72700,
      "date": 1665500400,
      "close": 7640
    },
    {
      "volume": 48600,
      "date": 1665586800,
      "close": 7540
    },
    {
      "volume": 92200,
      "date": 1665673200,
      "close": 7710
    },
    {
      "volume": 47800,
      "date": 1665932400,
      "close": 7690
    },
    {
      "volume": 56000,
      "date": 1666018800,
      "close": 7780
    },
    {
      "volume": 44700,
      "date": 1666105200,
      "close": 7780
    },
    {
      "volume": 40900,
      "date": 1666191600,
      "close": 7760
    },
    {
      "volume": 50400,
      "date": 1666278000,
      "close": 7740
    },
    {
      "volume": 75200,
      "date": 1666537200,
      "close": 7800
    },
    {
      "volume": 148200,
      "date": 1666623600,
      "close": 7620
    },
    {
      "volume": 102700,
      "date": 1666710000,
      "close": 7810
    },
    {
      "volume": 71300,
      "date": 1666796400,
      "close": 7720
    },
    {
      "volume": 197400,
      "date": 1666882800,
      "close": 7610
    },
    {
      "volume": 95700,
      "date": 1667142000,
      "close": 7780
    },
    {
      "volume": 65700,
      "date": 1667228400,
      "close": 7820
    },
    {
      "volume": 77300,
      "date": 1667314800,
      "close": 7670
    },
    {
      "volume": 87400,
      "date": 1667487600,
      "close": 7700
    },
    {
      "volume": 67600,
      "date": 1667746800,
      "close": 7790
    },
    {
      "volume": 404700,
      "date": 1667833200,
      "close": 8290
    },
    {
      "volume": 287700,
      "date": 1667919600,
      "close": 8270
    },
    {
      "volume": 128100,
      "date": 1668006000,
      "close": 8130
    },
    {
      "volume": 152700,
      "date": 1668092400,
      "close": 8280
    },
    {
      "volume": 224600,
      "date": 1668351600,
      "close": 8720
    },
    {
      "volume": 219500,
      "date": 1668438000,
      "close": 8890
    },
    {
      "volume": 180300,
      "date": 1668524400,
      "close": 9100
    },
    {
      "volume": 153900,
      "date": 1668610800,
      "close": 9200
    },
    {
      "volume": 170600,
      "date": 1668697200,
      "close": 9300
    },
    {
      "volume": 230800,
      "date": 1668956400,
      "close": 9500
    },
    {
      "volume": 239100,
      "date": 1669042800,
      "close": 9590
    },
    {
      "volume": 157600,
      "date": 1669215600,
      "close": 9760
    },
    {
      "volume": 108400,
      "date": 1669302000,
      "close": 9650
    },
    {
      "volume": 168200,
      "date": 1669561200,
      "close": 9720
    },
    {
      "volume": 184100,
      "date": 1669647600,
      "close": 9500
    },
    {
      "volume": 199300,
      "date": 1669734000,
      "close": 9420
    },
    {
      "volume": 109000,
      "date": 1669820400,
      "close": 9560
    },
    {
      "volume": 98600,
      "date": 1669906800,
      "close": 9330
    },
    {
      "volume": 95000,
      "date": 1670166000,
      "close": 9270
    },
    {
      "volume": 102600,
      "date": 1670252400,
      "close": 9400
    },
    {
      "volume": 67800,
      "date": 1670338800,
      "close": 9430
    },
    {
      "volume": 84500,
      "date": 1670425200,
      "close": 9510
    },
    {
      "volume": 84000,
      "date": 1670511600,
      "close": 9590
    },
    {
      "volume": 72400,
      "date": 1670770800,
      "close": 9530
    },
    {
      "volume": 135900,
      "date": 1670857200,
      "close": 9700
    },
    {
      "volume": 104800,
      "date": 1670943600,
      "close": 9710
    },
    {
      "volume": 132800,
      "date": 1671030000,
      "close": 9410
    },
    {
      "volume": 184800,
      "date": 1671116400,
      "close": 9680
    },
    {
      "volume": 147100,
      "date": 1671375600,
      "close": 9590
    },
    {
      "volume": 133800,
      "date": 1671462000,
      "close": 9330
    },
    {
      "volume": 116700,
      "date": 1671548400,
      "close": 9360
    },
    {
      "volume": 81900,
      "date": 1671634800,
      "close": 9570
    },
    {
      "volume": 66800,
      "date": 1671980400,
      "close": 9540
    },
    {
      "volume": 57700,
      "date": 1672153200,
      "close": 9610
    },
    {
      "volume": 54900,
      "date": 1672326000,
      "close": 9550
    },
    {
      "volume": 123700,
      "date": 1672758000,
      "close": 9300
    },
    {
      "volume": 113400,
      "date": 1672844400,
      "close": 9150
    },
    {
      "volume": 96900,
      "date": 1672930800,
      "close": 9000
    },
    {
      "volume": 82400,
      "date": 1673362800,
      "close": 9250
    },
    {
      "volume": 130200,
      "date": 1673449200,
      "close": 9130
    },
    {
      "volume": 78800,
      "date": 1673535600,
      "close": 9020
    },
    {
      "volume": 76200,
      "date": 1673794800,
      "close": 9070
    },
    {
      "volume": 51200,
      "date": 1673881200,
      "close": 9090
    },
    {
      "volume": 103200,
      "date": 1673967600,
      "close": 9230
    },
    {
      "volume": 85700,
      "date": 1674140400,
      "close": 9420
    },
    {
      "volume": 76600,
      "date": 1674399600,
      "close": 9510
    },
    {
      "volume": 119300,
      "date": 1674486000,
      "close": 9490
    },
    {
      "volume": 111100,
      "date": 1674572400,
      "close": 9670
    },
    {
      "volume": 82000,
      "date": 1674658800,
      "close": 9700
    },
    {
      "volume": 76200,
      "date": 1674745200,
      "close": 9790
    },
    {
      "volume": 128100,
      "date": 1675090800,
      "close": 9860
    },
    {
      "volume": 89100,
      "date": 1675177200,
      "close": 9860
    },
    {
      "volume": 88400,
      "date": 1675263600,
      "close": 9770
    },
    {
      "volume": 141200,
      "date": 1675350000,
      "close": 9900
    },
    {
      "volume": 114800,
      "date": 1675609200,
      "close": 9770
    },
    {
      "volume": 145700,
      "date": 1675695600,
      "close": 9880
    },
    {
      "volume": 417200,
      "date": 1675782000,
      "close": 10330
    },
    {
      "volume": 221700,
      "date": 1675868400,
      "close": 10520
    },
    {
      "volume": 199800,
      "date": 1675954800,
      "close": 10920
    },
    {
      "volume": 179900,
      "date": 1676214000,
      "close": 10350
    },
    {
      "volume": 133900,
      "date": 1676300400,
      "close": 10760
    },
    {
      "volume": 85900,
      "date": 1676386800,
      "close": 10800
    },
    {
      "volume": 158000,
      "date": 1676473200,
      "close": 10990
    },
    {
      "volume": 186800,
      "date": 1676559600,
      "close": 11040
    },
    {
      "volume": 158100,
      "date": 1676818800,
      "close": 11350
    },
    {
      "volume": 202300,
      "date": 1676905200,
      "close": 11480
    },
    {
      "volume": 144400,
      "date": 1676991600,
      "close": 11620
    },
    {
      "volume": 150300,
      "date": 1677164400,
      "close": 11610
    },
    {
      "volume": 122200,
      "date": 1677423600,
      "close": 11640
    },
    {
      "volume": 130700,
      "date": 1677510000,
      "close": 11830
    },
    {
      "volume": 125600,
      "date": 1677596400,
      "close": 11990
    },
    {
      "volume": 165800,
      "date": 1677682800,
      "close": 11920
    },
    {
      "volume": 160800,
      "date": 1677769200,
      "close": 12080
    },
    {
      "volume": 200300,
      "date": 1678028400,
      "close": 11890
    },
    {
      "volume": 137200,
      "date": 1678114800,
      "close": 12030
    },
    {
      "volume": 125800,
      "date": 1678201200,
      "close": 12070
    },
    {
      "volume": 191700,
      "date": 1678287600,
      "close": 12230
    },
    {
      "volume": 168700,
      "date": 1678374000,
      "close": 11970
    },
    {
      "volume": 134500,
      "date": 1678633200,
      "close": 11730
    },
    {
      "volume": 186500,
      "date": 1678719600,
      "close": 11390
    },
    {
      "volume": 138200,
      "date": 1678806000,
      "close": 11470
    },
    {
      "volume": 276100,
      "date": 1678892400,
      "close": 11100
    },
    {
      "volume": 184300,
      "date": 1678978800,
      "close": 11400
    },
    {
      "volume": 92600,
      "date": 1679238000,
      "close": 11300
    },
    {
      "volume": 114600,
      "date": 1679410800,
      "close": 11340
    },
    {
      "volume": 89900,
      "date": 1679497200,
      "close": 11340
    },
    {
      "volume": 129600,
      "date": 1679583600,
      "close": 11610
    },
    {
      "volume": 116100,
      "date": 1679842800,
      "close": 11750
    },
    {
      "volume": 117800,
      "date": 1679929200,
      "close": 11890
    },
    {
      "volume": 333600,
      "date": 1680015600,
      "close": 12450
    },
    {
      "volume": 152800,
      "date": 1680102000,
      "close": 12280
    },
    {
      "volume": 172700,
      "date": 1680188400,
      "close": 12600
    },
    {
      "volume": 183600,
      "date": 1680447600,
      "close": 12600
    },
    {
      "volume": 207700,
      "date": 1680534000,
      "close": 12820
    },
    {
      "volume": 250900,
      "date": 1680620400,
      "close": 12430
    },
    {
      "volume": 233800,
      "date": 1680706800,
      "close": 11970
    },
    {
      "volume": 174600,
      "date": 1680793200,
      "close": 12300
    },
    {
      "volume": 93900,
      "date": 1681052400,
      "close": 12470
    },
    {
      "volume": 115600,
      "date": 1681138800,
      "close": 12550
    },
    {
      "volume": 67900,
      "date": 1681225200,
      "close": 12630
    },
    {
      "volume": 122400,
      "date": 1681311600,
      "close": 12650
    },
    {
      "volume": 101500,
      "date": 1681398000,
      "close": 12690
    },
    {
      "volume": 109900,
      "date": 1681657200,
      "close": 12560
    },
    {
      "volume": 242600,
      "date": 1681743600,
      "close": 12460
    },
    {
      "volume": 142100,
      "date": 1681830000,
      "close": 12370
    },
    {
      "volume": 154300,
      "date": 1681916400,
      "close": 12230
    },
    {
      "volume": 178600,
      "date": 1682002800,
      "close": 12210
    },
    {
      "volume": 132400,
      "date": 1682262000,
      "close": 12130
    },
    {
      "volume": 146700,
      "date": 1682348400,
      "close": 12220
    },
    {
      "volume": 202500,
      "date": 1682434800,
      "close": 12310
    },
    {
      "volume": 135200,
      "date": 1682521200,
      "close": 12350
    }
  ],
  "corporate_url": "https://www.goldwin.co.jp",
  "performances": [
    {
      "standard": "JP",
      "netsales_growth_yoy": "--",
      "pbr": "7.5x",
      "fy_end_str": "2023-03-31",
      "np": "--",
      "div_yld": "0.7%",
      "netsales": "--",
      "purpose": "current",
      "cad": "--",
      "grsd": "--",
      "se": "--",
      "alert": {
        "se": "NotExist",
        "nd": "NotExist",
        "cad": "NotExist",
        "eps": "NotExist",
        "ebitda": "NotExist",
        "grsd": "NotExist",
        "payout_ratio": "NotExist",
        "da": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "--",
        "pbr": "7.463x",
        "np": "--",
        "netsales": "--",
        "div_yld": "0.688%",
        "cad": "--",
        "grsd": "--",
        "se": "--",
        "shareprice": "12,350",
        "per": "28.049x",
        "op": "--",
        "dps": "--",
        "eps": "--",
        "mv": "556.17",
        "ebitda": "--",
        "opm": "--",
        "ev": "506.24",
        "totshout": "45.034",
        "ebt": "--",
        "nd": "--",
        "name": "2023/4/27",
        "split_event": "--",
        "ev_ebitda": "22.609x",
        "payout_ratio": "--",
        "da": "--"
      },
      "shareprice": "12,350",
      "per": "28.0x",
      "op": "--",
      "is_detailedly_tagged": true,
      "dps": "--",
      "mv": "556",
      "eps": "--",
      "ebitda": "--",
      "opm": "--",
      "is_unavailable": false,
      "ev": "506",
      "period_end_str": "2023-04-27",
      "standing": "Current",
      "totshout": "45.0",
      "consolidated": true,
      "ebt": "--",
      "nd": "--",
      "name": "2023/4/27",
      "split_event": "--",
      "ev_ebitda": "22.6x",
      "yearly": false,
      "payout_ratio": "--",
      "da": "--"
    },
    {
      "netsales_growth_yoy": "15.5%",
      "standard": "JP",
      "pbr": "--",
      "np": "20.0",
      "fy_end_str": "2023-03-31",
      "netsales": "114",
      "div_yld": "--",
      "purpose": "accumulated",
      "cad": "--",
      "grsd": "--",
      "se": "--",
      "alert": {
        "pbr": "NotExist",
        "div_yld": "NotExist",
        "cad": "NotExist",
        "mv": "NotExist",
        "ebitda": "NotExist",
        "grsd": "NotExist",
        "ev": "NotExist",
        "se": "NotExist",
        "totshout": "NotExist",
        "shareprice": "NotExist",
        "nd": "NotExist",
        "ev_ebitda": "NotExist",
        "per": "NotExist",
        "da": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "15.539%",
        "pbr": "--",
        "np": "20.000",
        "netsales": "113.50",
        "div_yld": "--",
        "cad": "--",
        "grsd": "--",
        "se": "--",
        "shareprice": "--",
        "per": "--",
        "op": "20.300",
        "dps": "90",
        "eps": "444.1052",
        "mv": "--",
        "ebitda": "--",
        "opm": "17.885%",
        "ev": "--",
        "totshout": "--",
        "ebt": "26.200",
        "nd": "--",
        "name": "連23.3会予",
        "split_event": "--",
        "ev_ebitda": "--",
        "payout_ratio": "20.27%",
        "da": "--"
      },
      "shareprice": "--",
      "per": "--",
      "op": "20.3",
      "is_detailedly_tagged": true,
      "dps": "90",
      "eps": "444.11",
      "mv": "--",
      "ebitda": "--",
      "opm": "17.9%",
      "is_unavailable": false,
      "period_end_str": "2023-03-31",
      "standing": "Prediction",
      "ev": "--",
      "consolidated": true,
      "totshout": "--",
      "ebt": "26.2",
      "nd": "--",
      "name": "連23.3会予",
      "split_event": "--",
      "ev_ebitda": "--",
      "payout_ratio": "20%",
      "yearly": true,
      "da": "--"
    },
    {
      "netsales_growth_yoy": "17.6%",
      "standard": "JP",
      "pbr": "--",
      "np": "16.3",
      "fy_end_str": "2023-03-31",
      "netsales": "86.7",
      "div_yld": "--",
      "purpose": "ytd",
      "cad": "--",
      "grsd": "--",
      "se": "--",
      "alert": {
        "pbr": "NotExist",
        "div_yld": "NotExist",
        "cad": "NotExist",
        "mv": "NotExist",
        "grsd": "NotExist",
        "ev": "NotExist",
        "se": "NotExist",
        "totshout": "NotExist",
        "shareprice": "NotExist",
        "nd": "NotExist",
        "ev_ebitda": "NotExist",
        "per": "NotExist",
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "17.571%",
        "pbr": "--",
        "np": "16.268",
        "netsales": "86.746",
        "div_yld": "--",
        "cad": "--",
        "grsd": "--",
        "se": "--",
        "shareprice": "--",
        "per": "--",
        "op": "18.281",
        "dps": "25",
        "eps": "",
        "mv": "--",
        "ebitda": "19.618",
        "opm": "21.074%",
        "ev": "--",
        "totshout": "",
        "ebt": "21.903",
        "nd": "--",
        "name": "YTD",
        "split_event": "--",
        "ev_ebitda": "--",
        "payout_ratio": "--",
        "da": "1.3365"
      },
      "shareprice": "--",
      "per": "--",
      "op": "18.3",
      "is_detailedly_tagged": true,
      "dps": "25",
      "eps": "",
      "mv": "--",
      "ebitda": "19.6",
      "opm": "21.1%",
      "is_unavailable": false,
      "period_end_str": "2022-12-31",
      "standing": "Current",
      "ev": "--",
      "consolidated": true,
      "totshout": "",
      "ebt": "21.9",
      "nd": "--",
      "name": "YTD",
      "split_event": "--",
      "ev_ebitda": "--",
      "da": "1.34",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 3
    },
    {
      "netsales_growth_yoy": "16.5%",
      "standard": "JP",
      "pbr": "5.8x",
      "np": "10.4",
      "fy_end_str": "2023-03-31",
      "div_yld": "0.9%",
      "netsales": "41.4",
      "purpose": "accumulated",
      "cad": "53.6",
      "grsd": "3.51",
      "se": "73.6",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "16.481%",
        "pbr": "5.771x",
        "np": "10.424",
        "netsales": "41.437",
        "div_yld": "0.942%",
        "cad": "53.570",
        "grsd": "3.5070",
        "se": "73.643",
        "shareprice": "9,550",
        "per": "21.689x",
        "op": "13.004",
        "dps": "--",
        "eps": "231.4676",
        "mv": "430.08",
        "ebitda": "13.450",
        "opm": "31.383%",
        "ev": "380.14",
        "totshout": "45.034",
        "ebt": "14.470",
        "nd": "△50.063",
        "name": "Q3",
        "split_event": "--",
        "ev_ebitda": "16.978x",
        "payout_ratio": "--",
        "da": "0.44550"
      },
      "shareprice": "9,550",
      "per": "21.7x",
      "op": "13.0",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "231.47",
      "mv": "430",
      "ebitda": "13.4",
      "opm": "31.4%",
      "is_unavailable": false,
      "ev": "380",
      "period_end_str": "2022-12-31",
      "standing": "Current",
      "totshout": "45.0",
      "consolidated": true,
      "nd": "△50.1",
      "ebt": "14.5",
      "name": "Q3",
      "split_event": "--",
      "ev_ebitda": "17.0x",
      "da": "0.446",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 3
    },
    {
      "netsales_growth_yoy": "14.6%",
      "standard": "JP",
      "pbr": "5.2x",
      "np": "3.24",
      "fy_end_str": "2023-03-31",
      "div_yld": "1.2%",
      "netsales": "24.2",
      "purpose": "accumulated",
      "cad": "40.3",
      "grsd": "3.11",
      "se": "64.3",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "14.576%",
        "pbr": "5.207x",
        "np": "3.2410",
        "netsales": "24.210",
        "div_yld": "1.175%",
        "cad": "40.262",
        "grsd": "3.1130",
        "se": "64.326",
        "shareprice": "7,660",
        "per": "19.638x",
        "op": "3.0110",
        "dps": "25",
        "eps": "71.9849",
        "mv": "344.88",
        "ebitda": "3.4565",
        "opm": "12.437%",
        "ev": "307.84",
        "totshout": "45.023",
        "ebt": "3.9810",
        "nd": "△37.149",
        "name": "Q2",
        "split_event": "--",
        "ev_ebitda": "15.219x",
        "payout_ratio": "19.26%",
        "da": "0.44550"
      },
      "shareprice": "7,660",
      "per": "19.6x",
      "op": "3.01",
      "is_detailedly_tagged": true,
      "dps": "25",
      "eps": "71.98",
      "mv": "345",
      "ebitda": "3.46",
      "opm": "12.4%",
      "is_unavailable": false,
      "ev": "308",
      "period_end_str": "2022-09-30",
      "standing": "Current",
      "totshout": "45.0",
      "consolidated": true,
      "nd": "△37.1",
      "ebt": "3.98",
      "name": "Q2",
      "split_event": "--",
      "ev_ebitda": "15.2x",
      "payout_ratio": "19%",
      "da": "0.446",
      "yearly": false,
      "quarter": 2
    },
    {
      "netsales_growth_yoy": "23.5%",
      "standard": "JP",
      "pbr": "5.5x",
      "np": "2.60",
      "fy_end_str": "2023-03-31",
      "div_yld": "1.1%",
      "netsales": "21.1",
      "purpose": "accumulated",
      "cad": "43.6",
      "grsd": "3.67",
      "se": "60.9",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "23.545%",
        "pbr": "5.538x",
        "np": "2.6030",
        "netsales": "21.099",
        "div_yld": "1.115%",
        "cad": "43.571",
        "grsd": "3.6730",
        "se": "60.945",
        "shareprice": "7,620",
        "per": "21.815x",
        "op": "2.2660",
        "dps": "--",
        "eps": "57.8476",
        "mv": "342.88",
        "ebitda": "2.7115",
        "opm": "10.740%",
        "ev": "303.08",
        "totshout": "44.998",
        "ebt": "3.4520",
        "nd": "△39.898",
        "name": "Q1",
        "split_event": "--",
        "ev_ebitda": "15.679x",
        "payout_ratio": "--",
        "da": "0.44550"
      },
      "shareprice": "7,620",
      "per": "21.8x",
      "op": "2.27",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "57.85",
      "mv": "343",
      "ebitda": "2.71",
      "opm": "10.7%",
      "is_unavailable": false,
      "ev": "303",
      "period_end_str": "2022-06-30",
      "standing": "Current",
      "totshout": "45.0",
      "consolidated": true,
      "nd": "△39.9",
      "ebt": "3.45",
      "name": "Q1",
      "split_event": "--",
      "ev_ebitda": "15.7x",
      "da": "0.446",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 1
    },
    {
      "netsales_growth_yoy": "8.6%",
      "standard": "JP",
      "pbr": "4.4x",
      "np": "14.4",
      "fy_end_str": "2022-03-31",
      "div_yld": "1.4%",
      "netsales": "98.2",
      "purpose": "accumulated",
      "cad": "45.8",
      "grsd": "5.71",
      "se": "63.3",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "8.572%",
        "pbr": "4.440x",
        "np": "14.350",
        "netsales": "98.235",
        "div_yld": "1.369%",
        "cad": "45.818",
        "grsd": "5.7120",
        "se": "63.335",
        "shareprice": "6,210",
        "per": "19.580x",
        "op": "16.501",
        "dps": "85",
        "eps": "317.1558",
        "mv": "280.98",
        "ebitda": "18.147",
        "opm": "16.797%",
        "ev": "241.00",
        "totshout": "45.246",
        "ebt": "20.131",
        "nd": "△40.106",
        "name": "連22.3",
        "split_event": "--",
        "ev_ebitda": "13.281x",
        "payout_ratio": "26.80%",
        "da": "1.6460"
      },
      "shareprice": "6,210",
      "per": "19.6x",
      "op": "16.5",
      "is_detailedly_tagged": true,
      "dps": "85",
      "eps": "317.16",
      "mv": "281",
      "ebitda": "18.1",
      "opm": "16.8%",
      "is_unavailable": false,
      "ev": "241",
      "period_end_str": "2022-03-31",
      "standing": "Current",
      "totshout": "45.2",
      "consolidated": true,
      "ebt": "20.1",
      "nd": "△40.1",
      "name": "連22.3",
      "split_event": "--",
      "ev_ebitda": "13.3x",
      "payout_ratio": "27%",
      "da": "1.65",
      "yearly": true
    },
    {
      "netsales_growth_yoy": "15.1%",
      "standard": "JP",
      "pbr": "4.4x",
      "np": "3.56",
      "fy_end_str": "2022-03-31",
      "div_yld": "1.4%",
      "netsales": "24.5",
      "purpose": "accumulated",
      "cad": "45.8",
      "grsd": "5.71",
      "se": "63.3",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "15.057%",
        "pbr": "4.440x",
        "np": "3.5610",
        "netsales": "24.453",
        "div_yld": "1.369%",
        "cad": "45.818",
        "grsd": "5.7120",
        "se": "63.335",
        "shareprice": "6,210",
        "per": "19.580x",
        "op": "2.3440",
        "dps": "65",
        "eps": "78.7033",
        "mv": "280.98",
        "ebitda": "2.7730",
        "opm": "9.586%",
        "ev": "241.00",
        "totshout": "45.246",
        "ebt": "4.6740",
        "nd": "△40.106",
        "name": "Q4",
        "split_event": "--",
        "ev_ebitda": "13.281x",
        "payout_ratio": "25.10%",
        "da": "0.42900"
      },
      "shareprice": "6,210",
      "per": "19.6x",
      "op": "2.34",
      "is_detailedly_tagged": true,
      "dps": "65",
      "eps": "78.70",
      "mv": "281",
      "ebitda": "2.77",
      "opm": "9.6%",
      "is_unavailable": false,
      "ev": "241",
      "period_end_str": "2022-03-31",
      "standing": "Current",
      "totshout": "45.2",
      "consolidated": true,
      "nd": "△40.1",
      "ebt": "4.67",
      "name": "Q4",
      "split_event": "--",
      "ev_ebitda": "13.3x",
      "payout_ratio": "25%",
      "da": "0.429",
      "yearly": false,
      "quarter": 4
    },
    {
      "netsales_growth_yoy": "△5.6%",
      "standard": "JP",
      "pbr": "5.1x",
      "np": "8.16",
      "fy_end_str": "2022-03-31",
      "div_yld": "1.1%",
      "netsales": "35.6",
      "purpose": "accumulated",
      "cad": "43.2",
      "grsd": "7.64",
      "se": "60.6",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "△5.559%",
        "pbr": "5.050x",
        "np": "8.1570",
        "netsales": "35.574",
        "div_yld": "1.126%",
        "cad": "43.151",
        "grsd": "7.6440",
        "se": "60.639",
        "shareprice": "6,660",
        "per": "24.603x",
        "op": "10.858",
        "dps": "--",
        "eps": "179.7097",
        "mv": "302.30",
        "ebitda": "11.287",
        "opm": "30.522%",
        "ev": "266.93",
        "totshout": "45.390",
        "ebt": "11.609",
        "nd": "△35.507",
        "name": "Q3",
        "split_event": "--",
        "ev_ebitda": "15.648x",
        "payout_ratio": "--",
        "da": "0.42900"
      },
      "shareprice": "6,660",
      "per": "24.6x",
      "op": "10.9",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "179.71",
      "mv": "302",
      "ebitda": "11.3",
      "opm": "30.5%",
      "is_unavailable": false,
      "ev": "267",
      "period_end_str": "2021-12-31",
      "standing": "Current",
      "totshout": "45.4",
      "consolidated": true,
      "nd": "△35.5",
      "ebt": "11.6",
      "name": "Q3",
      "split_event": "--",
      "ev_ebitda": "15.6x",
      "da": "0.429",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 3
    },
    {
      "netsales_growth_yoy": "9.2%",
      "standard": "JP",
      "pbr": "6.2x",
      "np": "1.40",
      "fy_end_str": "2022-03-31",
      "div_yld": "1.0%",
      "netsales": "21.1",
      "purpose": "accumulated",
      "cad": "33.3",
      "grsd": "8.96",
      "se": "53.4",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "9.154%",
        "pbr": "6.234x",
        "np": "1.3970",
        "netsales": "21.130",
        "div_yld": "1.029%",
        "cad": "33.250",
        "grsd": "8.9560",
        "se": "53.363",
        "shareprice": "7,290",
        "per": "25.961x",
        "op": "2.1640",
        "dps": "20",
        "eps": "30.7849",
        "mv": "330.82",
        "ebitda": "2.5580",
        "opm": "10.241%",
        "ev": "306.63",
        "totshout": "45.379",
        "ebt": "2.1370",
        "nd": "△24.294",
        "name": "Q2",
        "split_event": "--",
        "ev_ebitda": "16.542x",
        "payout_ratio": "34.48%",
        "da": "0.39400"
      },
      "shareprice": "7,290",
      "per": "26.0x",
      "op": "2.16",
      "is_detailedly_tagged": true,
      "dps": "20",
      "eps": "30.78",
      "mv": "331",
      "ebitda": "2.56",
      "opm": "10.2%",
      "is_unavailable": false,
      "ev": "307",
      "period_end_str": "2021-09-30",
      "standing": "Current",
      "totshout": "45.4",
      "consolidated": true,
      "nd": "△24.3",
      "ebt": "2.14",
      "name": "Q2",
      "split_event": "--",
      "ev_ebitda": "16.5x",
      "payout_ratio": "34%",
      "da": "0.394",
      "yearly": false,
      "quarter": 2
    },
    {
      "netsales_growth_yoy": "40.0%",
      "standard": "JP",
      "pbr": "5.7x",
      "np": "1.24",
      "fy_end_str": "2022-03-31",
      "div_yld": "1.1%",
      "netsales": "17.1",
      "purpose": "accumulated",
      "cad": "38.5",
      "grsd": "9.89",
      "se": "52.4",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "39.984%",
        "pbr": "5.702x",
        "np": "1.2350",
        "netsales": "17.078",
        "div_yld": "1.072%",
        "cad": "38.549",
        "grsd": "9.8860",
        "se": "52.417",
        "shareprice": "6,530",
        "per": "24.176x",
        "op": "1.1350",
        "dps": "--",
        "eps": "27.2067",
        "mv": "296.42",
        "ebitda": "1.5290",
        "opm": "6.646%",
        "ev": "267.83",
        "totshout": "45.393",
        "ebt": "1.7110",
        "nd": "△28.663",
        "name": "Q1",
        "split_event": "--",
        "ev_ebitda": "14.794x",
        "payout_ratio": "--",
        "da": "0.39400"
      },
      "shareprice": "6,530",
      "per": "24.2x",
      "op": "1.14",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "27.21",
      "mv": "296",
      "ebitda": "1.53",
      "opm": "6.6%",
      "is_unavailable": false,
      "ev": "268",
      "period_end_str": "2021-06-30",
      "standing": "Current",
      "totshout": "45.4",
      "consolidated": true,
      "nd": "△28.7",
      "ebt": "1.71",
      "name": "Q1",
      "split_event": "--",
      "ev_ebitda": "14.8x",
      "da": "0.394",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 1
    },
    {
      "netsales_growth_yoy": "△7.6%",
      "standard": "JP",
      "pbr": "6.1x",
      "np": "10.7",
      "fy_end_str": "2021-03-31",
      "div_yld": "1.0%",
      "netsales": "90.5",
      "purpose": "accumulated",
      "cad": "39.6",
      "grsd": "11.5",
      "se": "53.8",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "△7.579%",
        "pbr": "6.082x",
        "np": "10.734",
        "netsales": "90.479",
        "div_yld": "0.989%",
        "cad": "39.588",
        "grsd": "11.490",
        "se": "53.810",
        "shareprice": "7,080",
        "per": "29.917x",
        "op": "14.838",
        "dps": "70",
        "eps": "236.6586",
        "mv": "321.12",
        "ebitda": "16.507",
        "opm": "16.399%",
        "ev": "293.14",
        "totshout": "45.356",
        "ebt": "15.557",
        "nd": "△28.098",
        "name": "連21.3",
        "split_event": "--",
        "ev_ebitda": "17.759x",
        "payout_ratio": "29.58%",
        "da": "1.6690"
      },
      "shareprice": "7,080",
      "per": "29.9x",
      "op": "14.8",
      "is_detailedly_tagged": true,
      "dps": "70",
      "eps": "236.66",
      "mv": "321",
      "ebitda": "16.5",
      "opm": "16.4%",
      "is_unavailable": false,
      "ev": "293",
      "period_end_str": "2021-03-31",
      "standing": "Prior",
      "totshout": "45.4",
      "consolidated": true,
      "ebt": "15.6",
      "nd": "△28.1",
      "name": "連21.3",
      "split_event": "--",
      "ev_ebitda": "17.8x",
      "payout_ratio": "30%",
      "da": "1.67",
      "yearly": true
    },
    {
      "netsales_growth_yoy": "△3.6%",
      "standard": "JP",
      "pbr": "6.1x",
      "np": "1.50",
      "fy_end_str": "2021-03-31",
      "div_yld": "1.0%",
      "netsales": "21.3",
      "purpose": "accumulated",
      "cad": "39.6",
      "grsd": "11.5",
      "se": "53.8",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "△3.641%",
        "pbr": "6.082x",
        "np": "1.4980",
        "netsales": "21.253",
        "div_yld": "0.989%",
        "cad": "39.588",
        "grsd": "11.490",
        "se": "53.810",
        "shareprice": "7,080",
        "per": "29.917x",
        "op": "1.2610",
        "dps": "55",
        "eps": "33.0273",
        "mv": "321.12",
        "ebitda": "1.6845",
        "opm": "5.933%",
        "ev": "293.14",
        "totshout": "45.356",
        "ebt": "1.9960",
        "nd": "△28.098",
        "name": "Q4",
        "split_event": "--",
        "ev_ebitda": "17.759x",
        "payout_ratio": "24.67%",
        "da": "0.42350"
      },
      "shareprice": "7,080",
      "per": "29.9x",
      "op": "1.26",
      "is_detailedly_tagged": true,
      "dps": "55",
      "eps": "33.03",
      "mv": "321",
      "ebitda": "1.68",
      "opm": "5.9%",
      "is_unavailable": false,
      "ev": "293",
      "period_end_str": "2021-03-31",
      "standing": "Prior",
      "totshout": "45.4",
      "consolidated": true,
      "nd": "△28.1",
      "ebt": "2.00",
      "name": "Q4",
      "split_event": "--",
      "ev_ebitda": "17.8x",
      "payout_ratio": "25%",
      "da": "0.424",
      "yearly": false,
      "quarter": 4
    },
    {
      "netsales_growth_yoy": "8.6%",
      "standard": "JP",
      "pbr": "6.1x",
      "np": "8.61",
      "fy_end_str": "2021-03-31",
      "div_yld": "0.9%",
      "netsales": "37.7",
      "purpose": "accumulated",
      "cad": "40.3",
      "grsd": "13.6",
      "se": "52.3",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "8.632%",
        "pbr": "6.107x",
        "np": "8.6130",
        "netsales": "37.668",
        "div_yld": "0.881%",
        "cad": "40.279",
        "grsd": "13.646",
        "se": "52.306",
        "shareprice": "6,810",
        "per": "36.12x",
        "op": "12.341",
        "dps": "--",
        "eps": "189.9175",
        "mv": "308.84",
        "ebitda": "12.765",
        "opm": "32.763%",
        "ev": "282.32",
        "totshout": "45.351",
        "ebt": "12.456",
        "nd": "△26.633",
        "name": "Q3",
        "split_event": "--",
        "ev_ebitda": "17.047x",
        "payout_ratio": "--",
        "da": "0.42350"
      },
      "shareprice": "6,810",
      "per": "36x",
      "op": "12.3",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "189.92",
      "mv": "309",
      "ebitda": "12.8",
      "opm": "32.8%",
      "is_unavailable": false,
      "ev": "282",
      "period_end_str": "2020-12-31",
      "standing": "Current",
      "totshout": "45.4",
      "consolidated": true,
      "nd": "△26.6",
      "ebt": "12.5",
      "name": "Q3",
      "split_event": "--",
      "ev_ebitda": "17.0x",
      "da": "0.424",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 3
    },
    {
      "netsales_growth_yoy": "△16.2%",
      "standard": "JP",
      "pbr": "8.6x",
      "np": "0.915",
      "fy_end_str": "2021-03-31",
      "div_yld": "0.7%",
      "netsales": "19.4",
      "purpose": "accumulated",
      "cad": "30.5",
      "grsd": "18.8",
      "se": "46.0",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "△16.177%",
        "pbr": "8.620x",
        "np": "0.91500",
        "netsales": "19.358",
        "div_yld": "0.719%",
        "cad": "30.476",
        "grsd": "18.784",
        "se": "45.985",
        "shareprice": "8,340",
        "per": "48.75x",
        "op": "1.7150",
        "dps": "15",
        "eps": "20.0771",
        "mv": "380.09",
        "ebitda": "2.1260",
        "opm": "8.859%",
        "ev": "368.49",
        "totshout": "45.574",
        "ebt": "1.5180",
        "nd": "△11.692",
        "name": "Q2",
        "split_event": "--",
        "ev_ebitda": "24.711x",
        "payout_ratio": "109.73%",
        "da": "0.41100"
      },
      "shareprice": "8,340",
      "per": "49x",
      "op": "1.72",
      "is_detailedly_tagged": true,
      "dps": "15",
      "eps": "20.08",
      "mv": "380",
      "ebitda": "2.13",
      "opm": "8.9%",
      "is_unavailable": false,
      "ev": "368",
      "period_end_str": "2020-09-30",
      "standing": "Current",
      "totshout": "45.6",
      "consolidated": true,
      "nd": "△11.7",
      "ebt": "1.52",
      "name": "Q2",
      "split_event": "--",
      "ev_ebitda": "24.7x",
      "payout_ratio": "110%",
      "da": "0.411",
      "yearly": false,
      "quarter": 2
    },
    {
      "netsales_growth_yoy": "△32.5%",
      "standard": "JP",
      "pbr": "7.3x",
      "np": "△0.292",
      "fy_end_str": "2021-03-31",
      "div_yld": "0.9%",
      "netsales": "12.2",
      "purpose": "accumulated",
      "cad": "33.7",
      "grsd": "15.0",
      "se": "46.1",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "△32.500%",
        "pbr": "7.274x",
        "np": "△0.29200",
        "netsales": "12.200",
        "div_yld": "0.852%",
        "cad": "33.687",
        "grsd": "14.986",
        "se": "46.068",
        "shareprice": "7,040",
        "per": "35.053x",
        "op": "△0.47900",
        "dps": "--",
        "eps": "△6.4424",
        "mv": "319.09",
        "ebitda": "△0.068000",
        "opm": "△3.926%",
        "ev": "300.45",
        "totshout": "45.325",
        "ebt": "△0.41300",
        "nd": "△18.701",
        "name": "Q1",
        "split_event": "--",
        "ev_ebitda": "17.856x",
        "payout_ratio": "--",
        "da": "0.41100"
      },
      "shareprice": "7,040",
      "per": "35.1x",
      "op": "△0.479",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "△6.44",
      "mv": "319",
      "ebitda": "△0.0680",
      "opm": "△3.9%",
      "is_unavailable": false,
      "ev": "300",
      "period_end_str": "2020-06-30",
      "standing": "Current",
      "totshout": "45.3",
      "consolidated": true,
      "nd": "△18.7",
      "ebt": "△0.413",
      "name": "Q1",
      "split_event": "--",
      "ev_ebitda": "17.9x",
      "da": "0.411",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 1
    },
    {
      "netsales_growth_yoy": "15.3%",
      "standard": "JP",
      "pbr": "5.8x",
      "np": "10.8",
      "fy_end_str": "2020-03-31",
      "div_yld": "1.0%",
      "netsales": "97.9",
      "purpose": "accumulated",
      "cad": "35.0",
      "grsd": "5.72",
      "se": "48.4",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "15.265%",
        "pbr": "5.831x",
        "np": "10.770",
        "netsales": "97.899",
        "div_yld": "0.997%",
        "cad": "34.963",
        "grsd": "5.7160",
        "se": "48.443",
        "shareprice": "6,020",
        "per": "25.316x",
        "op": "17.480",
        "dps": "60",
        "eps": "237.7903",
        "mv": "272.66",
        "ebitda": "19.202",
        "opm": "17.855%",
        "ev": "243.51",
        "totshout": "45.292",
        "ebt": "16.070",
        "nd": "△29.247",
        "name": "連20.3",
        "split_event": {
          "hint": "2019-09-27: 2分割",
          "text": "2分割"
        },
        "ev_ebitda": "12.681x",
        "payout_ratio": "25.23%",
        "da": "1.7220"
      },
      "shareprice": "6,020",
      "per": "25.3x",
      "op": "17.5",
      "is_detailedly_tagged": true,
      "dps": "60",
      "eps": "237.79",
      "mv": "273",
      "ebitda": "19.2",
      "opm": "17.9%",
      "is_unavailable": false,
      "ev": "244",
      "period_end_str": "2020-03-31",
      "standing": "Prior",
      "totshout": "45.3",
      "consolidated": true,
      "ebt": "16.1",
      "nd": "△29.2",
      "name": "連20.3",
      "split_event": {
        "hint": "2019-09-27: 2分割",
        "text": "2分割"
      },
      "ev_ebitda": "12.7x",
      "payout_ratio": "25%",
      "da": "1.72",
      "yearly": true
    },
    {
      "netsales_growth_yoy": "3.9%",
      "standard": "JP",
      "pbr": "5.8x",
      "np": "△0.686",
      "fy_end_str": "2020-03-31",
      "div_yld": "1.0%",
      "netsales": "22.1",
      "purpose": "accumulated",
      "cad": "35.0",
      "grsd": "5.72",
      "se": "48.4",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "3.901%",
        "pbr": "5.831x",
        "np": "△0.68600",
        "netsales": "22.056",
        "div_yld": "0.997%",
        "cad": "34.963",
        "grsd": "5.7160",
        "se": "48.443",
        "shareprice": "6,020",
        "per": "25.316x",
        "op": "1.2830",
        "dps": "45",
        "eps": "△15.1462",
        "mv": "272.66",
        "ebitda": "1.7385",
        "opm": "5.817%",
        "ev": "243.51",
        "totshout": "45.292",
        "ebt": "△0.39200",
        "nd": "△29.247",
        "name": "Q4",
        "split_event": "--",
        "ev_ebitda": "12.681x",
        "payout_ratio": "28.41%",
        "da": "0.45550"
      },
      "shareprice": "6,020",
      "per": "25.3x",
      "op": "1.28",
      "is_detailedly_tagged": true,
      "dps": "45",
      "eps": "△15.15",
      "mv": "273",
      "ebitda": "1.74",
      "opm": "5.8%",
      "is_unavailable": false,
      "ev": "244",
      "period_end_str": "2020-03-31",
      "standing": "Prior",
      "totshout": "45.3",
      "consolidated": true,
      "nd": "△29.2",
      "ebt": "△0.392",
      "name": "Q4",
      "split_event": "--",
      "ev_ebitda": "12.7x",
      "payout_ratio": "28%",
      "da": "0.456",
      "yearly": false,
      "quarter": 4
    },
    {
      "netsales_growth_yoy": "14.4%",
      "standard": "JP",
      "pbr": "7.7x",
      "np": "7.86",
      "fy_end_str": "2020-03-31",
      "div_yld": "0.6%",
      "netsales": "34.7",
      "purpose": "accumulated",
      "cad": "40.9",
      "grsd": "8.37",
      "se": "49.1",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "14.435%",
        "pbr": "7.709x",
        "np": "7.8590",
        "netsales": "34.675",
        "div_yld": "0.617%",
        "cad": "40.931",
        "grsd": "8.3650",
        "se": "49.125",
        "shareprice": "8,020",
        "per": "27.753x",
        "op": "10.660",
        "dps": "--",
        "eps": "173.5351",
        "mv": "363.21",
        "ebitda": "11.116",
        "opm": "30.743%",
        "ev": "330.74",
        "totshout": "45.288",
        "ebt": "11.189",
        "nd": "△32.566",
        "name": "Q3",
        "split_event": "--",
        "ev_ebitda": "18.259x",
        "payout_ratio": "--",
        "da": "0.45550"
      },
      "shareprice": "8,020",
      "per": "27.8x",
      "op": "10.7",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "173.54",
      "mv": "363",
      "ebitda": "11.1",
      "opm": "30.7%",
      "is_unavailable": false,
      "ev": "331",
      "period_end_str": "2019-12-31",
      "standing": "Current",
      "totshout": "45.3",
      "consolidated": true,
      "nd": "△32.6",
      "ebt": "11.2",
      "name": "Q3",
      "split_event": "--",
      "ev_ebitda": "18.3x",
      "da": "0.456",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 3
    },
    {
      "netsales_growth_yoy": "24.2%",
      "standard": "JP",
      "pbr": "10.4x",
      "np": "2.22",
      "fy_end_str": "2020-03-31",
      "div_yld": "0.5%",
      "netsales": "23.1",
      "purpose": "accumulated",
      "cad": "29.0",
      "grsd": "9.93",
      "se": "42.0",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "24.248%",
        "pbr": "10.379x",
        "np": "2.2220",
        "netsales": "23.094",
        "div_yld": "0.535%",
        "cad": "29.045",
        "grsd": "9.9250",
        "se": "41.963",
        "shareprice": "9,260",
        "per": "37.18x",
        "op": "3.6350",
        "dps": "15",
        "eps": "49.0719",
        "mv": "419.30",
        "ebitda": "4.0405",
        "opm": "15.740%",
        "ev": "400.25",
        "totshout": "45.281",
        "ebt": "3.3650",
        "nd": "△19.120",
        "name": "Q2",
        "split_event": {
          "hint": "2019-09-27: 2分割",
          "text": "2分割"
        },
        "ev_ebitda": "25.184x",
        "payout_ratio": "18.88%",
        "da": "0.40550"
      },
      "shareprice": "9,260",
      "per": "37x",
      "op": "3.64",
      "is_detailedly_tagged": true,
      "dps": "15",
      "eps": "49.07",
      "mv": "419",
      "ebitda": "4.04",
      "opm": "15.7%",
      "is_unavailable": false,
      "ev": "400",
      "period_end_str": "2019-09-30",
      "standing": "Current",
      "totshout": "45.3",
      "consolidated": true,
      "nd": "△19.1",
      "ebt": "3.37",
      "name": "Q2",
      "split_event": {
        "hint": "2019-09-27: 2分割",
        "text": "2分割"
      },
      "ev_ebitda": "25.2x",
      "payout_ratio": "19%",
      "da": "0.406",
      "yearly": false,
      "quarter": 2
    },
    {
      "netsales_growth_yoy": "22.0%",
      "standard": "JP",
      "pbr": "7.8x",
      "np": "1.38",
      "fy_end_str": "2020-03-31",
      "div_yld": "0.6%",
      "netsales": "18.1",
      "purpose": "accumulated",
      "cad": "33.8",
      "grsd": "9.84",
      "se": "39.7",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "21.973%",
        "pbr": "7.849x",
        "np": "1.3750",
        "netsales": "18.074",
        "div_yld": "0.629%",
        "cad": "33.771",
        "grsd": "9.8410",
        "se": "39.734",
        "shareprice": "6,755",
        "per": "30.491x",
        "op": "1.9020",
        "dps": "--",
        "eps": "30.3710",
        "mv": "305.82",
        "ebitda": "2.3075",
        "opm": "10.523%",
        "ev": "281.94",
        "totshout": "22.637",
        "ebt": "1.9080",
        "nd": "△23.930",
        "name": "Q1",
        "split_event": "--",
        "ev_ebitda": "19.905x",
        "payout_ratio": "--",
        "da": "0.40550"
      },
      "shareprice": "6,755",
      "per": "30.5x",
      "op": "1.90",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "30.37",
      "mv": "306",
      "ebitda": "2.31",
      "opm": "10.5%",
      "is_unavailable": false,
      "ev": "282",
      "period_end_str": "2019-06-30",
      "standing": "Current",
      "totshout": "22.6",
      "consolidated": true,
      "nd": "△23.9",
      "ebt": "1.91",
      "name": "Q1",
      "split_event": "--",
      "ev_ebitda": "19.9x",
      "da": "0.406",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 1
    },
    {
      "netsales_growth_yoy": "20.6%",
      "standard": "JP",
      "pbr": "9.2x",
      "np": "9.24",
      "fy_end_str": "2019-03-31",
      "div_yld": "0.5%",
      "netsales": "84.9",
      "purpose": "accumulated",
      "cad": "33.2",
      "grsd": "8.48",
      "se": "40.0",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "20.611%",
        "pbr": "9.223x",
        "np": "9.2430",
        "netsales": "84.934",
        "div_yld": "0.527%",
        "cad": "33.222",
        "grsd": "8.4790",
        "se": "39.956",
        "shareprice": "8,060",
        "per": "39.46x",
        "op": "11.861",
        "dps": "42.5",
        "eps": "204.2756",
        "mv": "364.70",
        "ebitda": "13.393",
        "opm": "13.965%",
        "ev": "340.02",
        "totshout": "22.624",
        "ebt": "12.702",
        "nd": "△24.743",
        "name": "連19.3",
        "split_event": "--",
        "ev_ebitda": "25.388x",
        "payout_ratio": "20.81%",
        "da": "1.5320"
      },
      "shareprice": "8,060",
      "per": "39x",
      "op": "11.9",
      "is_detailedly_tagged": true,
      "dps": "42.5",
      "eps": "204.28",
      "mv": "365",
      "ebitda": "13.4",
      "opm": "14.0%",
      "is_unavailable": false,
      "ev": "340",
      "period_end_str": "2019-03-31",
      "standing": "Prior",
      "totshout": "22.6",
      "consolidated": true,
      "ebt": "12.7",
      "nd": "△24.7",
      "name": "連19.3",
      "split_event": "--",
      "ev_ebitda": "25.4x",
      "payout_ratio": "21%",
      "da": "1.53",
      "yearly": true
    },
    {
      "netsales_growth_yoy": "13.8%",
      "standard": "JP",
      "pbr": "9.2x",
      "np": "1.63",
      "fy_end_str": "2019-03-31",
      "div_yld": "0.5%",
      "netsales": "21.2",
      "purpose": "accumulated",
      "cad": "33.2",
      "grsd": "8.48",
      "se": "40.0",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "13.847%",
        "pbr": "9.223x",
        "np": "1.6310",
        "netsales": "21.228",
        "div_yld": "0.527%",
        "cad": "33.222",
        "grsd": "8.4790",
        "se": "39.956",
        "shareprice": "8,060",
        "per": "39.46x",
        "op": "0.24400",
        "dps": "34.5",
        "eps": "36.0460",
        "mv": "364.70",
        "ebitda": "0.65000",
        "opm": "1.149%",
        "ev": "340.02",
        "totshout": "22.624",
        "ebt": "1.2520",
        "nd": "△24.743",
        "name": "Q4",
        "split_event": "--",
        "ev_ebitda": "25.388x",
        "payout_ratio": "20.33%",
        "da": "0.40600"
      },
      "shareprice": "8,060",
      "per": "39x",
      "op": "0.244",
      "is_detailedly_tagged": true,
      "dps": "34.5",
      "eps": "36.05",
      "mv": "365",
      "ebitda": "0.650",
      "opm": "1.1%",
      "is_unavailable": false,
      "ev": "340",
      "period_end_str": "2019-03-31",
      "standing": "Prior",
      "totshout": "22.6",
      "consolidated": true,
      "nd": "△24.7",
      "ebt": "1.25",
      "name": "Q4",
      "split_event": "--",
      "ev_ebitda": "25.4x",
      "payout_ratio": "20%",
      "da": "0.406",
      "yearly": false,
      "quarter": 4
    },
    {
      "netsales_growth_yoy": "31.7%",
      "standard": "JP",
      "pbr": "7.0x",
      "np": "6.05",
      "fy_end_str": "2019-03-31",
      "div_yld": "0.5%",
      "netsales": "30.3",
      "purpose": "accumulated",
      "cad": "36.6",
      "grsd": "13.3",
      "se": "38.3",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "31.658%",
        "pbr": "6.956x",
        "np": "6.0490",
        "netsales": "30.301",
        "div_yld": "0.498%",
        "cad": "36.593",
        "grsd": "13.269",
        "se": "38.325",
        "shareprice": "5,875",
        "per": "32.480x",
        "op": "8.4890",
        "dps": "--",
        "eps": "133.6941",
        "mv": "265.81",
        "ebitda": "8.8950",
        "opm": "28.016%",
        "ev": "242.55",
        "totshout": "22.623",
        "ebt": "8.7610",
        "nd": "△23.324",
        "name": "Q3",
        "split_event": "--",
        "ev_ebitda": "17.675x",
        "payout_ratio": "--",
        "da": "0.40600"
      },
      "shareprice": "5,875",
      "per": "32.5x",
      "op": "8.49",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "133.69",
      "mv": "266",
      "ebitda": "8.90",
      "opm": "28.0%",
      "is_unavailable": false,
      "ev": "243",
      "period_end_str": "2018-12-31",
      "standing": "Current",
      "totshout": "22.6",
      "consolidated": true,
      "nd": "△23.3",
      "ebt": "8.76",
      "name": "Q3",
      "split_event": "--",
      "ev_ebitda": "17.7x",
      "da": "0.406",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 3
    },
    {
      "netsales_growth_yoy": "13.5%",
      "standard": "JP",
      "pbr": "5.5x",
      "np": "0.975",
      "fy_end_str": "2019-03-31",
      "div_yld": "0.7%",
      "netsales": "18.6",
      "purpose": "accumulated",
      "cad": "27.1",
      "grsd": "14.6",
      "se": "32.6",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "13.488%",
        "pbr": "5.483x",
        "np": "0.97500",
        "netsales": "18.587",
        "div_yld": "0.745%",
        "cad": "27.140",
        "grsd": "14.558",
        "se": "32.646",
        "shareprice": "3,925",
        "per": "31.304x",
        "op": "1.9520",
        "dps": "8",
        "eps": "21.5528",
        "mv": "177.56",
        "ebitda": "2.3120",
        "opm": "10.502%",
        "ev": "165.01",
        "totshout": "22.619",
        "ebt": "1.6200",
        "nd": "△12.582",
        "name": "Q2",
        "split_event": "--",
        "ev_ebitda": "15.977x",
        "payout_ratio": "23.15%",
        "da": "0.36000"
      },
      "shareprice": "3,925",
      "per": "31.3x",
      "op": "1.95",
      "is_detailedly_tagged": true,
      "dps": "8",
      "eps": "21.55",
      "mv": "178",
      "ebitda": "2.31",
      "opm": "10.5%",
      "is_unavailable": false,
      "ev": "165",
      "period_end_str": "2018-09-30",
      "standing": "Current",
      "totshout": "22.6",
      "consolidated": true,
      "nd": "△12.6",
      "ebt": "1.62",
      "name": "Q2",
      "split_event": "--",
      "ev_ebitda": "16.0x",
      "payout_ratio": "23%",
      "da": "0.360",
      "yearly": false,
      "quarter": 2
    },
    {
      "netsales_growth_yoy": "19.7%",
      "standard": "JP",
      "pbr": "6.4x",
      "np": "0.588",
      "fy_end_str": "2019-03-31",
      "div_yld": "0.4%",
      "netsales": "14.8",
      "purpose": "accumulated",
      "cad": "30.4",
      "grsd": "11.5",
      "se": "34.5",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "19.683%",
        "pbr": "6.443x",
        "np": "0.58800",
        "netsales": "14.818",
        "div_yld": "0.443%",
        "cad": "30.440",
        "grsd": "11.528",
        "se": "34.526",
        "shareprice": "4,800",
        "per": "41.23x",
        "op": "1.1760",
        "dps": "--",
        "eps": "12.7968",
        "mv": "220.55",
        "ebitda": "1.5360",
        "opm": "7.936%",
        "ev": "201.67",
        "totshout": "22.974",
        "ebt": "1.0690",
        "nd": "△18.912",
        "name": "Q1",
        "split_event": "--",
        "ev_ebitda": "21.812x",
        "payout_ratio": "--",
        "da": "0.36000"
      },
      "shareprice": "4,800",
      "per": "41x",
      "op": "1.18",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "12.80",
      "mv": "221",
      "ebitda": "1.54",
      "opm": "7.9%",
      "is_unavailable": false,
      "ev": "202",
      "period_end_str": "2018-06-30",
      "standing": "Current",
      "totshout": "23.0",
      "consolidated": true,
      "nd": "△18.9",
      "ebt": "1.07",
      "name": "Q1",
      "split_event": "--",
      "ev_ebitda": "21.8x",
      "da": "0.360",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 1
    },
    {
      "netsales_growth_yoy": "15.6%",
      "standard": "JP",
      "pbr": "4.1x",
      "np": "5.17",
      "fy_end_str": "2018-03-31",
      "div_yld": "0.7%",
      "netsales": "70.4",
      "purpose": "accumulated",
      "cad": "30.0",
      "grsd": "11.2",
      "se": "34.9",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "15.626%",
        "pbr": "4.141x",
        "np": "5.1740",
        "netsales": "70.420",
        "div_yld": "0.666%",
        "cad": "29.974",
        "grsd": "11.216",
        "se": "34.934",
        "shareprice": "3,190",
        "per": "28.320x",
        "op": "7.1020",
        "dps": "21.2500",
        "eps": "112.6424",
        "mv": "146.53",
        "ebitda": "8.5730",
        "opm": "10.085%",
        "ev": "127.81",
        "totshout": "22.966",
        "ebt": "7.5840",
        "nd": "△18.758",
        "name": "連18.3",
        "split_event": {
          "hint": "2018-03-28: 2分割",
          "text": "2分割"
        },
        "ev_ebitda": "14.909x",
        "payout_ratio": "18.87%",
        "da": "1.4710"
      },
      "shareprice": "3,190",
      "per": "28.3x",
      "op": "7.10",
      "is_detailedly_tagged": true,
      "dps": "21.25",
      "eps": "112.64",
      "mv": "147",
      "ebitda": "8.57",
      "opm": "10.1%",
      "is_unavailable": false,
      "ev": "128",
      "period_end_str": "2018-03-31",
      "standing": "Prior",
      "totshout": "23.0",
      "consolidated": true,
      "ebt": "7.58",
      "nd": "△18.8",
      "name": "連18.3",
      "split_event": {
        "hint": "2018-03-28: 2分割",
        "text": "2分割"
      },
      "ev_ebitda": "14.9x",
      "payout_ratio": "19%",
      "da": "1.47",
      "yearly": true
    },
    {
      "netsales_growth_yoy": "15.1%",
      "standard": "JP",
      "pbr": "4.1x",
      "np": "0.572",
      "fy_end_str": "2018-03-31",
      "div_yld": "0.7%",
      "netsales": "18.6",
      "purpose": "accumulated",
      "cad": "30.0",
      "grsd": "11.2",
      "se": "34.9",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "15.099%",
        "pbr": "4.141x",
        "np": "0.57200",
        "netsales": "18.646",
        "div_yld": "0.666%",
        "cad": "29.974",
        "grsd": "11.216",
        "se": "34.934",
        "shareprice": "3,190",
        "per": "28.320x",
        "op": "0.59000",
        "dps": "21.2500",
        "eps": "12.4529",
        "mv": "146.53",
        "ebitda": "0.97950",
        "opm": "3.164%",
        "ev": "127.81",
        "totshout": "22.966",
        "ebt": "0.90500",
        "nd": "△18.758",
        "name": "Q4",
        "split_event": {
          "hint": "2018-03-28: 2分割",
          "text": "2分割"
        },
        "ev_ebitda": "14.909x",
        "payout_ratio": "18.87%",
        "da": "0.38950"
      },
      "shareprice": "3,190",
      "per": "28.3x",
      "op": "0.590",
      "is_detailedly_tagged": true,
      "dps": "21.25",
      "eps": "12.45",
      "mv": "147",
      "ebitda": "0.980",
      "opm": "3.2%",
      "is_unavailable": false,
      "ev": "128",
      "period_end_str": "2018-03-31",
      "standing": "Prior",
      "totshout": "23.0",
      "consolidated": true,
      "nd": "△18.8",
      "ebt": "0.905",
      "name": "Q4",
      "split_event": {
        "hint": "2018-03-28: 2分割",
        "text": "2分割"
      },
      "ev_ebitda": "14.9x",
      "payout_ratio": "19%",
      "da": "0.390",
      "yearly": false,
      "quarter": 4
    },
    {
      "netsales_growth_yoy": "26.2%",
      "standard": "JP",
      "pbr": "2.9x",
      "np": "3.54",
      "fy_end_str": "2018-03-31",
      "div_yld": "0.7%",
      "netsales": "23.0",
      "purpose": "accumulated",
      "cad": "33.3",
      "grsd": "15.4",
      "se": "34.4",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "26.220%",
        "pbr": "2.926x",
        "np": "3.5370",
        "netsales": "23.015",
        "div_yld": "0.728%",
        "cad": "33.292",
        "grsd": "15.443",
        "se": "34.360",
        "shareprice": "2,232.5",
        "per": "19.719x",
        "op": "5.1110",
        "dps": "--",
        "eps": "79.3434",
        "mv": "99.521",
        "ebitda": "5.5005",
        "opm": "22.207%",
        "ev": "81.711",
        "totshout": "11.145",
        "ebt": "5.1710",
        "nd": "△17.849",
        "name": "Q3",
        "split_event": "--",
        "ev_ebitda": "9.964x",
        "payout_ratio": "--",
        "da": "0.38950"
      },
      "shareprice": "2,232.5",
      "per": "19.7x",
      "op": "5.11",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "79.34",
      "mv": "99.5",
      "ebitda": "5.50",
      "opm": "22.2%",
      "is_unavailable": false,
      "ev": "81.7",
      "period_end_str": "2017-12-31",
      "standing": "Current",
      "totshout": "11.1",
      "consolidated": true,
      "nd": "△17.8",
      "ebt": "5.17",
      "name": "Q3",
      "split_event": "--",
      "ev_ebitda": "10.0x",
      "da": "0.390",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 3
    },
    {
      "netsales_growth_yoy": "3.7%",
      "standard": "JP",
      "pbr": "2.9x",
      "np": "0.653",
      "fy_end_str": "2018-03-31",
      "div_yld": "0.8%",
      "netsales": "16.4",
      "purpose": "accumulated",
      "cad": "29.0",
      "grsd": "15.8",
      "se": "32.1",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "3.704%",
        "pbr": "2.878x",
        "np": "0.65300",
        "netsales": "16.378",
        "div_yld": "0.809%",
        "cad": "28.975",
        "grsd": "15.807",
        "se": "32.108",
        "shareprice": "2,007.5",
        "per": "23.268x",
        "op": "0.88400",
        "dps": "--",
        "eps": "14.4532",
        "mv": "90.700",
        "ebitda": "1.2300",
        "opm": "5.397%",
        "ev": "77.558",
        "totshout": "11.295",
        "ebt": "0.84000",
        "nd": "△13.168",
        "name": "Q2",
        "split_event": "--",
        "ev_ebitda": "12.849x",
        "payout_ratio": "--",
        "da": "0.34600"
      },
      "shareprice": "2,007.5",
      "per": "23.3x",
      "op": "0.884",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "14.45",
      "mv": "90.7",
      "ebitda": "1.23",
      "opm": "5.4%",
      "is_unavailable": false,
      "ev": "77.6",
      "period_end_str": "2017-09-30",
      "standing": "Current",
      "totshout": "11.3",
      "consolidated": true,
      "nd": "△13.2",
      "ebt": "0.840",
      "name": "Q2",
      "split_event": "--",
      "ev_ebitda": "12.8x",
      "da": "0.346",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 2
    },
    {
      "netsales_growth_yoy": "16.0%",
      "standard": "JP",
      "pbr": "2.5x",
      "np": "0.412",
      "fy_end_str": "2018-03-31",
      "div_yld": "0.9%",
      "netsales": "12.4",
      "purpose": "accumulated",
      "cad": "25.8",
      "grsd": "9.15",
      "se": "32.7",
      "alert": {
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "15.970%",
        "pbr": "2.462x",
        "np": "0.41200",
        "netsales": "12.381",
        "div_yld": "0.943%",
        "cad": "25.795",
        "grsd": "9.1460",
        "se": "32.740",
        "shareprice": "1,722.5",
        "per": "20.272x",
        "op": "0.51700",
        "dps": "--",
        "eps": "8.9809",
        "mv": "79.020",
        "ebitda": "0.86300",
        "opm": "4.176%",
        "ev": "62.393",
        "totshout": "11.469",
        "ebt": "0.66800",
        "nd": "△16.649",
        "name": "Q1",
        "split_event": "--",
        "ev_ebitda": "10.350x",
        "payout_ratio": "--",
        "da": "0.34600"
      },
      "shareprice": "1,722.5",
      "per": "20.3x",
      "op": "0.517",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "8.98",
      "mv": "79.0",
      "ebitda": "0.863",
      "opm": "4.2%",
      "is_unavailable": false,
      "ev": "62.4",
      "period_end_str": "2017-06-30",
      "standing": "Current",
      "totshout": "11.5",
      "consolidated": true,
      "nd": "△16.6",
      "ebt": "0.668",
      "name": "Q1",
      "split_event": "--",
      "ev_ebitda": "10.3x",
      "da": "0.346",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 1
    },
    {
      "netsales_growth_yoy": "2.0%",
      "standard": "JP",
      "pbr": "2.1x",
      "np": "3.42",
      "fy_end_str": "2017-03-31",
      "div_yld": "1.1%",
      "netsales": "60.9",
      "purpose": "accumulated",
      "cad": "23.4",
      "grsd": "8.55",
      "se": "33.1",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "1.993%",
        "pbr": "2.104x",
        "np": "3.4240",
        "netsales": "60.903",
        "div_yld": "1.111%",
        "cad": "23.434",
        "grsd": "8.5530",
        "se": "33.085",
        "shareprice": "1,462.5",
        "per": "19.590x",
        "op": "3.9100",
        "dps": "16.2500",
        "eps": "74.6565",
        "mv": "67.075",
        "ebitda": "5.1790",
        "opm": "6.420%",
        "ev": "52.231",
        "totshout": "11.466",
        "ebt": "4.3210",
        "nd": "△14.881",
        "name": "連17.3",
        "split_event": "--",
        "ev_ebitda": "10.085x",
        "payout_ratio": "21.77%",
        "da": "1.2690"
      },
      "shareprice": "1,462.5",
      "per": "19.6x",
      "op": "3.91",
      "is_detailedly_tagged": true,
      "dps": "16.25",
      "eps": "74.66",
      "mv": "67.1",
      "ebitda": "5.18",
      "opm": "6.4%",
      "is_unavailable": false,
      "ev": "52.2",
      "period_end_str": "2017-03-31",
      "standing": "Prior",
      "totshout": "11.5",
      "consolidated": true,
      "ebt": "4.32",
      "nd": "△14.9",
      "name": "連17.3",
      "split_event": "--",
      "ev_ebitda": "10.1x",
      "payout_ratio": "22%",
      "da": "1.27",
      "yearly": true
    },
    {
      "standard": "JP",
      "netsales_growth_yoy": "--",
      "pbr": "2.1x",
      "np": "0.445",
      "fy_end_str": "2017-03-31",
      "div_yld": "1.1%",
      "netsales": "16.2",
      "purpose": "accumulated",
      "cad": "23.4",
      "grsd": "8.55",
      "se": "33.1",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "--",
        "pbr": "2.104x",
        "np": "0.44500",
        "netsales": "16.200",
        "div_yld": "1.111%",
        "cad": "23.434",
        "grsd": "8.5530",
        "se": "33.085",
        "shareprice": "1,462.5",
        "per": "19.590x",
        "op": "0.24900",
        "dps": "16.2500",
        "eps": "9.7027",
        "mv": "67.075",
        "ebitda": "0.60700",
        "opm": "1.537%",
        "ev": "52.231",
        "totshout": "11.466",
        "ebt": "0.51100",
        "nd": "△14.881",
        "name": "Q4",
        "split_event": "--",
        "ev_ebitda": "10.085x",
        "payout_ratio": "21.77%",
        "da": "0.35800"
      },
      "shareprice": "1,462.5",
      "per": "19.6x",
      "op": "0.249",
      "is_detailedly_tagged": true,
      "dps": "16.25",
      "eps": "9.70",
      "mv": "67.1",
      "ebitda": "0.607",
      "opm": "1.5%",
      "is_unavailable": false,
      "ev": "52.2",
      "period_end_str": "2017-03-31",
      "standing": "Prior",
      "totshout": "11.5",
      "consolidated": true,
      "nd": "△14.9",
      "ebt": "0.511",
      "name": "Q4",
      "split_event": "--",
      "ev_ebitda": "10.1x",
      "payout_ratio": "22%",
      "da": "0.358",
      "yearly": false,
      "quarter": 4
    },
    {
      "standard": "JP",
      "netsales_growth_yoy": "--",
      "pbr": "1.93x",
      "np": "2.39",
      "fy_end_str": "2017-03-31",
      "netsales": "18.2",
      "div_yld": "--",
      "purpose": "accumulated",
      "cad": "28.1",
      "grsd": "11.7",
      "se": "32.8",
      "alert": {
        "div_yld": "NotExist",
        "ev_ebitda": "NotExist",
        "per": "NotExist",
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "--",
        "pbr": "1.9324x",
        "np": "2.3880",
        "netsales": "18.234",
        "div_yld": "--",
        "cad": "28.104",
        "grsd": "11.664",
        "se": "32.811",
        "shareprice": "1,305",
        "per": "--",
        "op": "2.9780",
        "dps": "--",
        "eps": "51.9420",
        "mv": "59.997",
        "ebitda": "3.3360",
        "opm": "16.332%",
        "ev": "43.589",
        "totshout": "11.494",
        "ebt": "2.9500",
        "nd": "△16.440",
        "name": "Q3",
        "split_event": "--",
        "ev_ebitda": "--",
        "payout_ratio": "--",
        "da": "0.35800"
      },
      "shareprice": "1,305",
      "per": "--",
      "op": "2.98",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "51.94",
      "mv": "60.0",
      "ebitda": "3.34",
      "opm": "16.3%",
      "is_unavailable": false,
      "ev": "43.6",
      "period_end_str": "2016-12-31",
      "standing": "Current",
      "totshout": "11.5",
      "consolidated": true,
      "nd": "△16.4",
      "ebt": "2.95",
      "name": "Q3",
      "split_event": "--",
      "ev_ebitda": "--",
      "da": "0.358",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 3
    },
    {
      "standard": "JP",
      "netsales_growth_yoy": "--",
      "pbr": "2.2x",
      "np": "0.653",
      "fy_end_str": "2017-03-31",
      "netsales": "15.8",
      "div_yld": "--",
      "purpose": "accumulated",
      "cad": "22.5",
      "grsd": "9.26",
      "se": "30.4",
      "alert": {
        "div_yld": "NotExist",
        "ev_ebitda": "NotExist",
        "per": "NotExist",
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "--",
        "pbr": "2.181x",
        "np": "0.65300",
        "netsales": "15.793",
        "div_yld": "--",
        "cad": "22.537",
        "grsd": "9.2640",
        "se": "30.411",
        "shareprice": "1,320",
        "per": "--",
        "op": "0.94600",
        "dps": "--",
        "eps": "14.2067",
        "mv": "60.673",
        "ebitda": "1.2225",
        "opm": "5.990%",
        "ev": "47.424",
        "totshout": "11.491",
        "ebt": "0.90500",
        "nd": "△13.273",
        "name": "Q2",
        "split_event": "--",
        "ev_ebitda": "--",
        "payout_ratio": "--",
        "da": "0.27650"
      },
      "shareprice": "1,320",
      "per": "--",
      "op": "0.946",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "14.21",
      "mv": "60.7",
      "ebitda": "1.22",
      "opm": "6.0%",
      "is_unavailable": false,
      "ev": "47.4",
      "period_end_str": "2016-09-30",
      "standing": "Current",
      "totshout": "11.5",
      "consolidated": true,
      "nd": "△13.3",
      "ebt": "0.905",
      "name": "Q2",
      "split_event": "--",
      "ev_ebitda": "--",
      "da": "0.277",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 2
    },
    {
      "standard": "JP",
      "netsales_growth_yoy": "--",
      "pbr": "1.90x",
      "np": "△0.0620",
      "fy_end_str": "2017-03-31",
      "netsales": "10.7",
      "div_yld": "--",
      "purpose": "accumulated",
      "cad": "25.1",
      "grsd": "8.06",
      "se": "29.7",
      "alert": {
        "div_yld": "NotExist",
        "ev_ebitda": "NotExist",
        "per": "NotExist",
        "payout_ratio": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "--",
        "pbr": "1.9028x",
        "np": "△0.062000",
        "netsales": "10.676",
        "div_yld": "--",
        "cad": "25.075",
        "grsd": "8.0570",
        "se": "29.747",
        "shareprice": "1,160",
        "per": "--",
        "op": "△0.26300",
        "dps": "--",
        "eps": "△1.3491",
        "mv": "53.310",
        "ebitda": "0.013500",
        "opm": "△2.463%",
        "ev": "36.310",
        "totshout": "11.489",
        "ebt": "△0.045000",
        "nd": "△17.018",
        "name": "Q1",
        "split_event": "--",
        "ev_ebitda": "--",
        "payout_ratio": "--",
        "da": "0.27650"
      },
      "shareprice": "1,160",
      "per": "--",
      "op": "△0.263",
      "is_detailedly_tagged": true,
      "dps": "--",
      "eps": "△1.35",
      "mv": "53.3",
      "ebitda": "0.0135",
      "opm": "△2.5%",
      "is_unavailable": false,
      "ev": "36.3",
      "period_end_str": "2016-06-30",
      "standing": "Current",
      "totshout": "11.5",
      "consolidated": true,
      "nd": "△17.0",
      "ebt": "△0.0450",
      "name": "Q1",
      "split_event": "--",
      "ev_ebitda": "--",
      "da": "0.277",
      "yearly": false,
      "payout_ratio": "--",
      "quarter": 1
    },
    {
      "netsales_growth_yoy": "4.0%",
      "standard": "JP",
      "pbr": "1.77x",
      "np": "3.37",
      "fy_end_str": "2016-03-31",
      "div_yld": "1.2%",
      "netsales": "59.7",
      "purpose": "accumulated",
      "cad": "22.0",
      "grsd": "7.16",
      "se": "30.5",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "3.999%",
        "pbr": "1.7688x",
        "np": "3.3690",
        "netsales": "59.713",
        "div_yld": "1.207%",
        "cad": "22.041",
        "grsd": "7.1560",
        "se": "30.482",
        "shareprice": "1,138.7500",
        "per": "15.530x",
        "op": "3.1290",
        "dps": "13.7500",
        "eps": "73.3243",
        "mv": "52.322",
        "ebitda": "4.3290",
        "opm": "5.240%",
        "ev": "37.470",
        "totshout": "11.487",
        "ebt": "3.8280",
        "nd": "△14.885",
        "name": "連16.3",
        "split_event": {
          "hint": "2015-09-28: 0.2併合",
          "text": "0.2併合"
        },
        "ev_ebitda": "8.656x",
        "payout_ratio": "18.75%",
        "da": "1.2000"
      },
      "shareprice": "1,138.75",
      "per": "15.5x",
      "op": "3.13",
      "is_detailedly_tagged": true,
      "dps": "13.75",
      "eps": "73.32",
      "mv": "52.3",
      "ebitda": "4.33",
      "opm": "5.2%",
      "is_unavailable": false,
      "ev": "37.5",
      "period_end_str": "2016-03-31",
      "standing": "Prior",
      "totshout": "11.5",
      "consolidated": true,
      "ebt": "3.83",
      "nd": "△14.9",
      "name": "連16.3",
      "split_event": {
        "hint": "2015-09-28: 0.2併合",
        "text": "0.2併合"
      },
      "ev_ebitda": "8.7x",
      "payout_ratio": "19%",
      "da": "1.20",
      "yearly": true
    },
    {
      "netsales_growth_yoy": "4.6%",
      "standard": "JP",
      "pbr": "1.61x",
      "np": "3.47",
      "fy_end_str": "2015-03-31",
      "div_yld": "1.2%",
      "netsales": "57.4",
      "purpose": "accumulated",
      "cad": "18.7",
      "grsd": "5.33",
      "se": "27.7",
      "alert": {},
      "fine": {
        "netsales_growth_yoy": "4.644%",
        "pbr": "1.6135x",
        "np": "3.4710",
        "netsales": "57.417",
        "div_yld": "1.225%",
        "cad": "18.685",
        "grsd": "5.3260",
        "se": "27.661",
        "shareprice": "1,020",
        "per": "13.492x",
        "op": "2.4140",
        "dps": "12.5",
        "eps": "75.6008",
        "mv": "46.830",
        "ebitda": "3.4880",
        "opm": "4.204%",
        "ev": "33.551",
        "totshout": "57.390",
        "ebt": "3.9920",
        "nd": "△13.359",
        "name": "連15.3",
        "split_event": "--",
        "ev_ebitda": "9.619x",
        "payout_ratio": "16.53%",
        "da": "1.0740"
      },
      "shareprice": "1,020",
      "per": "13.5x",
      "op": "2.41",
      "is_detailedly_tagged": true,
      "dps": "12.5",
      "eps": "75.60",
      "mv": "46.8",
      "ebitda": "3.49",
      "opm": "4.2%",
      "is_unavailable": false,
      "ev": "33.6",
      "period_end_str": "2015-03-31",
      "standing": "Prior",
      "totshout": "57.4",
      "consolidated": true,
      "ebt": "3.99",
      "nd": "△13.4",
      "name": "連15.3",
      "split_event": "--",
      "ev_ebitda": "9.6x",
      "payout_ratio": "17%",
      "da": "1.07",
      "yearly": true
    },
    {
      "netsales_growth_yoy": "4.5%",
      "standard": "JP",
      "pbr": "--",
      "np": "3.02",
      "fy_end_str": "2014-03-31",
      "netsales": "54.9",
      "div_yld": "",
      "purpose": "accumulated",
      "cad": "--",
      "grsd": "--",
      "se": "--",
      "alert": {
        "pbr": "NotExist",
        "ev": "NotExist",
        "se": "NotExist",
        "div_yld": "NotExist",
        "shareprice": "NotExist",
        "mv": "NotExist",
        "eps": "NotExist",
        "ev_ebitda": "NotExist",
        "ebitda": "NotExist",
        "per": "NotExist",
        "payout_ratio": "NotExist",
        "da": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "4.492%",
        "pbr": "--",
        "np": "3.0210",
        "netsales": "54.869",
        "div_yld": "",
        "cad": "--",
        "grsd": "--",
        "se": "--",
        "shareprice": "--",
        "per": "--",
        "op": "3.9010",
        "dps": "",
        "eps": "",
        "mv": "--",
        "ebitda": "--",
        "opm": "7.110%",
        "ev": "--",
        "totshout": "",
        "ebt": "--",
        "nd": "△4.5760",
        "name": "連14.3",
        "split_event": "--",
        "ev_ebitda": "--",
        "payout_ratio": "",
        "da": "--"
      },
      "shareprice": "--",
      "per": "--",
      "op": "3.90",
      "is_detailedly_tagged": true,
      "dps": "",
      "eps": "",
      "mv": "--",
      "ebitda": "--",
      "opm": "7.1%",
      "is_unavailable": false,
      "period_end_str": "2014-03-31",
      "standing": "PriorShadow",
      "ev": "--",
      "totshout": "",
      "consolidated": true,
      "nd": "△4.58",
      "ebt": "--",
      "name": "連14.3",
      "split_event": "--",
      "ev_ebitda": "--",
      "yearly": true,
      "payout_ratio": "",
      "da": "--"
    },
    {
      "netsales_growth_yoy": "8.0%",
      "standard": "JP",
      "pbr": "--",
      "np": "2.64",
      "fy_end_str": "2013-03-31",
      "netsales": "52.5",
      "div_yld": "",
      "purpose": "accumulated",
      "cad": "--",
      "grsd": "--",
      "se": "--",
      "alert": {
        "pbr": "NotExist",
        "ev": "NotExist",
        "se": "NotExist",
        "div_yld": "NotExist",
        "shareprice": "NotExist",
        "mv": "NotExist",
        "eps": "NotExist",
        "ev_ebitda": "NotExist",
        "ebitda": "NotExist",
        "per": "NotExist",
        "payout_ratio": "NotExist",
        "da": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "7.954%",
        "pbr": "--",
        "np": "2.6390",
        "netsales": "52.510",
        "div_yld": "",
        "cad": "--",
        "grsd": "--",
        "se": "--",
        "shareprice": "--",
        "per": "--",
        "op": "3.1680",
        "dps": "",
        "eps": "",
        "mv": "--",
        "ebitda": "--",
        "opm": "6.033%",
        "ev": "--",
        "totshout": "",
        "ebt": "--",
        "nd": "△3.7610",
        "name": "連13.3",
        "split_event": "--",
        "ev_ebitda": "--",
        "payout_ratio": "",
        "da": "--"
      },
      "shareprice": "--",
      "per": "--",
      "op": "3.17",
      "is_detailedly_tagged": true,
      "dps": "",
      "eps": "",
      "mv": "--",
      "ebitda": "--",
      "opm": "6.0%",
      "is_unavailable": false,
      "period_end_str": "2013-03-31",
      "standing": "PriorShadow",
      "ev": "--",
      "totshout": "",
      "consolidated": true,
      "nd": "△3.76",
      "ebt": "--",
      "name": "連13.3",
      "split_event": "--",
      "ev_ebitda": "--",
      "yearly": true,
      "payout_ratio": "",
      "da": "--"
    },
    {
      "standard": "JP",
      "netsales_growth_yoy": "--",
      "pbr": "--",
      "np": "2.61",
      "fy_end_str": "2012-03-31",
      "netsales": "48.6",
      "div_yld": "",
      "purpose": "accumulated",
      "cad": "--",
      "grsd": "--",
      "se": "--",
      "alert": {
        "pbr": "NotExist",
        "ev": "NotExist",
        "se": "NotExist",
        "div_yld": "NotExist",
        "shareprice": "NotExist",
        "mv": "NotExist",
        "eps": "NotExist",
        "ev_ebitda": "NotExist",
        "ebitda": "NotExist",
        "per": "NotExist",
        "payout_ratio": "NotExist",
        "da": "NotExist"
      },
      "fine": {
        "netsales_growth_yoy": "--",
        "pbr": "--",
        "np": "2.6120",
        "netsales": "48.641",
        "div_yld": "",
        "cad": "--",
        "grsd": "--",
        "se": "--",
        "shareprice": "--",
        "per": "--",
        "op": "3.3210",
        "dps": "",
        "eps": "",
        "mv": "--",
        "ebitda": "--",
        "opm": "6.828%",
        "ev": "--",
        "totshout": "",
        "ebt": "--",
        "nd": "△4.9920",
        "name": "連12.3",
        "split_event": "--",
        "ev_ebitda": "--",
        "payout_ratio": "",
        "da": "--"
      },
      "shareprice": "--",
      "per": "--",
      "op": "3.32",
      "is_detailedly_tagged": true,
      "dps": "",
      "eps": "",
      "mv": "--",
      "ebitda": "--",
      "opm": "6.8%",
      "is_unavailable": false,
      "period_end_str": "2012-03-31",
      "standing": "PriorShadow",
      "ev": "--",
      "totshout": "",
      "consolidated": true,
      "nd": "△4.99",
      "ebt": "--",
      "name": "連12.3",
      "split_event": "--",
      "ev_ebitda": "--",
      "yearly": true,
      "payout_ratio": "",
      "da": "--"
    }
  ],
  "name_en": "GOLDWIN INC."
}
}

`;

export const rawTextAtom = atom<string>(defaultRawText);

const baseTextAtom = atom<string>(defaultRawText);

const jsonAtom = atom(
  (get) => {
    try {
      return JSON.parse(get(baseTextAtom).replace(/[\u0000-\u0019]+/g, ""));
    } catch (e) {
      console.error(e);
      return null;
    }
  }
);

const jsonStructureAtom = atom(
  (get) => {
    try {
      return structurizeJSON(get(jsonAtom))
    } catch (e) {
      console.error(e);
      return null;
    }
  },
);

/**
 * JSONフック
 * – rawText: テキストエリアの生テキスト
 * - baseText: ある時点での rawText のスナップショット
 * - json: JSON.parse(baseText) の結果得られるもの
 */
export const useJSON = () => {
  const [rawText, setRawtext] = useAtom(rawTextAtom);
  const [, setBaseText] = useAtom(baseTextAtom);
  const [jsonStructure] = useAtom(jsonStructureAtom);
  return {
    rawText,
    setRawtext,
    setBaseText,
    jsonStructure,
  };
};


