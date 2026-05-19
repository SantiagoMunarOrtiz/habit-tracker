import { analyticsService } from './src/services/analyticsService';
async function test() {
  const stats = await analyticsService.getDailyStats('6e332c85-4ba2-4f0c-9f87-275e8788fad3', '2026-05-18');
  console.log(JSON.stringify(stats, null, 2));
}
test().catch(console.error);
