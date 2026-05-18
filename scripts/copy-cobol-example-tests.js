import { execaCommand } from 'execa'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const REPO = 'https://github.com/stleary/JSON-java'
const COMMIT = '054786e300d0fc38f0cf7fc0f2db4d9b39cb6443'

const getTestName = (line) => {
  return (
    'json-java-' +
    line.toLowerCase().trim().replaceAll(' ', '-').replaceAll('/', '-')
  )
}

const getAllTests = async (folder) => {
  const dirents = await readdir(folder, { recursive: true })
  const allTests = []
  for (const dirent of dirents) {
    if (!dirent.endsWith('.json')) {
      continue
    }
    const filePath = `${folder}/${dirent}`
    const testName = getTestName(dirent)
    const fileContent = await readFile(filePath, 'utf8')
    allTests.push({
      testName,
      testContent: fileContent,
    })
  }
  return allTests
}

const writeTestFiles = async (allTests) => {
  for (const test of allTests) {
    await writeFile(
      `${root}/test/cases/${test.testName}.json`,
      test.testContent,
    )
  }
}

const main = async () => {
  process.chdir(root)
  await rm(`${root}/.tmp`, { recursive: true, force: true })
  await execaCommand(`git clone ${REPO} .tmp/json-java`)
  process.chdir(`${root}/.tmp/json-java`)
  await execaCommand(`git checkout ${COMMIT}`)
  process.chdir(root)
  await cp(
    `${root}/.tmp/json-java/src/test/resources`,
    `${root}/.tmp/json-java-tests`,
    {
      recursive: true,
    },
  )
  const allTests = await getAllTests(`${root}/.tmp/json-java-tests`)
  await writeTestFiles(allTests)
}

main()
