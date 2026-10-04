import { adminDb } from "./server.js";
import { rewardPolicy } from "../../src/lib/reward-policy.js";

export async function loadRewardPolicy() {
  return rewardPolicy((await adminDb.ref("public/site/rewardPolicy").get()).val());
}
