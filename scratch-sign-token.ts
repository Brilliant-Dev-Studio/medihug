import { signAdminToken } from './lib/jwt';
async function main() {
  const token = await signAdminToken({ id: 'cmqxpaecu00002rxfmu7dnvz7', name: 'Super Admin', phone: '09265577723', role: 'SUPER_ADMIN' });
  console.log(token);
}
main().finally(() => process.exit(0));
