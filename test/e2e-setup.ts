import * as dotenv from 'dotenv'
import * as execa from 'execa'

dotenv.config({
  path: '.env.test',
})

async function main() {
  await execa.command('npm run test:migrate')
}

main()
