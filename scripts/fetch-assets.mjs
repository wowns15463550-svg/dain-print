// 사진 원본(힉스필드 생성 이미지)을 내려받아 public/assets 에 webp 로 저장한다.
// 이미 있는 파일은 건너뛴다. 사진을 바꾸려면 public/assets 의 파일을 같은 이름으로 덮어쓰면 된다.
import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";

const BASE = "https://d8j0ntlcm91z4.cloudfront.net/user_3JLMWZZfNQHwBM2wE2jmL8UkvQ6/";
const OUT = "public/assets/";

// [파일 이름, 원본, 옵션]
const ASSETS = [
  ["hero-presses-r.webp", "hf_20261005_011758_6128b414-34ea-47d0-8d4c-e3b5895a2fba", { crop: { left: 380, top: 0, width: 964, height: 752 } }],
  ["h-output.webp", "hf_20261005_023107_87b9025a-9c0a-4ab0-8ef8-ece5e48d58aa"],
  ["h-binder.webp", "hf_20261005_023108_210f7fe5-0144-4780-b01a-c911f48cb86d"],
  ["h-cutter.webp", "hf_20261005_023108_a5303d10-ee83-4a3a-bd86-f5ff7219707b"],
  ["h-handover.webp", "hf_20261005_022339_bc4632da-9c4c-4028-a1c2-794cf8e039ed"],
  ["m-konica.webp", "hf_20261005_011757_505ab3af-c381-46cb-882b-8ac2a3654a6e"],
  ["m-canon.webp", "hf_20261005_011758_960d8cfc-208a-4c38-9fdf-490316c42a35"],
  ["l-perfect.webp", "hf_20261005_015338_24c3ca77-1a59-4ab7-b185-e091013b150a"],
  ["l-saddle.webp", "hf_20261005_011758_bc28e8f4-db2d-4650-b070-5935ec3e61d1"],
  ["l-spiral.webp", "hf_20261005_011758_dff2b8c7-3e11-4f5d-ba30-53341ca5e185"],
  ["l-flyer.webp", "hf_20261005_015338_7497ad15-01b4-4957-bcf2-5f97527e1f45"],
  ["l-card.webp", "hf_20261005_011757_21ca3f2c-8db0-42a6-8c6a-f38136370beb"],
  ["l-poster.webp", "hf_20261005_011758_cda70807-e770-4b51-8aac-1d61a17c5fae"],
  ["studio.webp", "hf_20261005_011759_8dbae3cf-edcf-4fd5-95ff-e1a06837a009"],
  ["step1.webp", "hf_20261005_020240_4cc2bee7-2419-4620-95c0-110d7658ef85", { max: 1100 }],
  ["step2.webp", "hf_20261005_020240_f68205dc-c274-4a27-a988-efce9ac85721", { max: 1100 }],
  ["step3.webp", "hf_20261005_020239_26c9e1fe-0ff7-4e19-a539-45bb82654141", { max: 1100 }],
  ["step4.webp", "hf_20261005_020240_1eb41ac2-028f-4f00-b621-e731b1ae56b5", { max: 1100 }],
  ["step5.webp", "hf_20261005_020239_1537bdae-7aef-41a8-bcad-eba877f6b880", { max: 1100 }],
  ["paper-mojo.webp", "hf_20261005_152325_25bd3e4f-bb5d-4bd2-9586-1cd623426c6e"],
  ["paper-mojo-use.webp", "hf_20261005_152327_98ef12a4-aaea-4c3b-9f4c-9e5a6eb69d59"],
  ["paper-snow.webp", "hf_20261005_152324_56f4e483-c4bb-4918-8e9b-8ffc66c5d8ad"],
  ["paper-snow-use.webp", "hf_20261005_152325_b08d0b6d-8529-46b8-ac3a-85f2017bfb28"],
  ["paper-rdv.webp", "hf_20261005_152324_02b8ead8-5bd1-4dc3-a617-4be190642603"],
  ["paper-snow2.webp", "hf_20261005_155137_26c57dcb-c234-49dd-8059-62f433e4e23a"],
  ["paper-rdv2.webp", "hf_20261005_155137_611c1365-96fe-414c-9dd1-5d3fc6b6c0be"],
  ["m-binder.webp", "hf_20261006_051359_fa59b171-cc67-4b9c-875f-b077fc5a9043", { max: 900 }],
  ["m-cutter.webp", "hf_20261006_051400_8616e514-e826-409b-a087-69e7c51f0efa", { max: 900 }],
  ["m-lami.webp", "hf_20261006_051358_bf8b8dad-3e5e-4d57-99b7-4a03c0c0c1cd", { max: 900 }],
  ["m-punch.webp", "hf_20261006_051358_e2110e8f-155e-4b6c-a90f-1164d4952932", { max: 900 }],
  ["l-spiral2.webp", "hf_20261006_081042_d10bb0dc-6dd8-4387-8227-7f63877b43bf", { max: 1100 }],
  ["l-spiral-x.webp", "hf_20261006_081042_0426b607-a67b-4e2a-b3f8-57e611fc4e9a", { max: 1400 }],
  ["g1.webp", "hf_20261006_151838_78aff8da-a601-421d-b378-fac6c8a6e6ef", { max: 900 }],
  ["g2.webp", "hf_20261006_151836_263c6ef9-63e6-4bcc-bfb5-c969913cff09", { max: 900 }],
  ["g3.webp", "hf_20261006_151837_92e9b334-dd4e-45eb-acfc-9b9bcdb2dabd", { max: 900 }],
  ["g4.webp", "hf_20261006_151839_e55b83d1-0223-4078-beee-08404738892b", { max: 900 }],
  ["g5.webp", "hf_20261006_151837_91059842-284b-41d3-985f-669a0a20e63a", { max: 900 }],
  ["g6.webp", "hf_20261006_151836_ad665605-e598-42d5-a7de-14d2e306f6fc", { max: 900 }],
  ["g7.webp", "hf_20261006_151835_3aef1160-6ae8-4cbc-bbe8-14ece507403f", { max: 900 }],
  ["g8.webp", "hf_20261006_151837_f862c59d-708b-4c6a-8da6-574214f903be", { max: 900 }],
  ["g9.webp", "hf_20261006_151836_37fc1cbb-8c98-4287-a90f-c7eec9f4dd42", { max: 900 }],
  ["m-crease.webp", "hf_20261006_153722_ce2600d2-9425-4224-9414-d03d4399f84c", { max: 900 }],
  ["m-binder2.webp", "hf_20261006_153721_7409483e-c19a-4ebb-ad88-d9397af18322", { max: 900 }],
  ["m-cutter2.webp", "hf_20261006_153719_a7464c47-fab3-4fc0-a871-af84fad5efce", { max: 900 }],
  ["m-lami2.webp", "hf_20261006_153721_d2089edf-b2b7-4bb0-9656-a464c40aec1c", { max: 900 }],
  ["m-punch2.webp", "hf_20261006_153719_e4c1ed9b-98bb-498f-9264-65f20c054a52", { max: 900 }],
  ["m-punch3b.webp", "hf_20261007_012943_c64a99f9-b236-445e-9ba1-a1a2a64d5962", { max: 900 }],
  ["ev1.webp", "hf_20261006_153720_23c80ece-9c6b-4861-8cec-3652eec04103", { max: 900 }],
  ["ev2.webp", "hf_20261006_153722_0a1a3250-78bd-4750-af52-88096ce340b9", { max: 900 }],
  ["ev3.webp", "hf_20261006_153720_4bb89304-6a4b-43f3-a5e8-1e10332c3c61", { max: 900 }],
  ["paper-mcopy.webp", "hf_20261006_051358_c636bbe0-84d1-4e09-857f-8ee39116155c", { max: 1100 }],
  ["paper-mcopy-use.webp", "hf_20261006_051359_c930b50e-082f-4564-a314-c3034b4d1a83", { max: 1100 }],
  ["paper-rdv-use.webp", "hf_20261005_152323_8b74e69e-b132-4bc3-8928-e425fa3a62ad"],
  ["check-bleed.webp", "hf_20261005_152323_c2433ce1-5299-40e5-aa58-ad935d7e3043", { max: 1100 }],
  ["check-safe.webp", "hf_20261005_152325_75670b4d-59b9-4134-810d-37a0f5e91bf4", { max: 1100 }],
  ["check-dpi.webp", "hf_20261005_152322_f4acbd04-35fa-4437-b12c-3dafc0f9a2e8", { max: 1100 }],
  ["check-cmyk.webp", "hf_20261005_152324_187067af-af4e-4ca5-95ea-ffdcb70135e2", { max: 1100 }],
  ["check-font.webp", "hf_20261005_152325_91dc3e70-2cb6-48aa-88a4-81cff45abf77", { max: 1100 }],
  ["check-order.webp", "hf_20261005_152324_f81fc9fa-b6e6-4731-aae8-abf9a6e24865", { max: 1100 }],
  ["l-invite.webp", "hf_20261005_152331_f2b83398-7c25-4582-8b25-f338ef8a3c5b"],
];

mkdirSync(OUT, { recursive: true });
let fetched = 0;

async function source(id) {
  const res = await fetch(BASE + id + ".png");
  if (!res.ok) throw new Error(`download failed ${res.status}: ${id}`);
  return Buffer.from(await res.arrayBuffer());
}

for (const [name, id, opt = {}] of ASSETS) {
  if (existsSync(OUT + name)) continue;
  let img = sharp(await source(id));
  if (opt.crop) img = img.extract(opt.crop);
  if (opt.max) img = img.resize({ width: opt.max, height: opt.max, fit: "inside", withoutEnlargement: true });
  await img.webp({ quality: 82 }).toFile(OUT + name);
  fetched++;
  console.log("saved", name);
}

// 링크 미리보기 이미지 (1200x630)
if (!existsSync(OUT + "og.jpg")) {
  const buf = await source("hf_20261005_011758_6128b414-34ea-47d0-8d4c-e3b5895a2fba");
  await sharp(buf).extract({ left: 380, top: 0, width: 964, height: 752 }).resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 82 }).toFile(OUT + "og.jpg");
  fetched++;
  console.log("saved og.jpg");
}
console.log(fetched ? `fetched ${fetched} file(s)` : "all assets present");
