// @ts-nocheck

import { execFile } from 'node:child_process'
import {
  mkdtemp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'
import path, { dirname, extname, relative } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const supportedExtensions = new Set(['.cbl', '.cob', '.cobol', '.cpy'])
const testCasesPath = path.join(root, 'test', 'cases')
const baselinesPath = path.join(root, 'test', 'baselines')

const sources = [
  {
    name: 'cobol-examples',
    repoUrl: 'https://github.com/shamrice/COBOL-Examples',
    repoFolder: 'COBOL-Examples',
    prefix: 'cobol-examples',
    includeDirectories: ['.'],
  },
  {
    name: 'exercism-cobol',
    repoUrl: 'https://github.com/exercism/cobol',
    repoFolder: 'cobol',
    prefix: 'exercism-cobol',
    includeDirectories: ['exercises/practice'],
  },
  {
    name: 'aws-carddemo',
    repoUrl:
      'https://github.com/aws-samples/aws-mainframe-modernization-carddemo',
    repoFolder: 'aws-mainframe-modernization-carddemo',
    prefix: 'aws-carddemo',
    includeDirectories: [
      'app/cbl',
      'app/cpy',
      'app/cpy-bms',
      'app/app-authorization-ims-db2-mq/cbl',
      'app/app-authorization-ims-db2-mq/cpy',
      'app/app-authorization-ims-db2-mq/cpy-bms',
      'app/app-transaction-type-db2/cbl',
      'app/app-transaction-type-db2/cpy',
      'app/app-vsam-mq/cbl',
    ],
  },
  {
    name: 'proleap-cobol-parser',
    repoUrl: 'https://github.com/uwol/proleap-cobol-parser',
    repoFolder: 'proleap-cobol-parser',
    prefix: 'proleap-cobol-parser',
    includeDirectories: [
      'src/test/resources/io/proleap/cobol/ast',
      'src/test/resources/io/proleap/cobol/preprocessor',
    ],
  },
]

const isCobolFile = (filePath) => {
  return supportedExtensions.has(extname(filePath).toLowerCase())
}

const sanitizeSegment = (value) => {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
}

const getTestName = (filePath, repoRoot, prefix) => {
  const relativePath = relative(repoRoot, filePath)
  const parts = relativePath.split(path.sep).filter(Boolean)
  const normalized = parts.map(sanitizeSegment).filter(Boolean).join('--')
  return `${prefix}--${normalized}`
}

const getAllCobolFiles = async (folder) => {
  const dirents = await readdir(folder, { withFileTypes: true })
  const allFiles = []
  for (const dirent of dirents) {
    const filePath = path.join(folder, dirent.name)
    if (dirent.isDirectory()) {
      const nestedFiles = await getAllCobolFiles(filePath)
      allFiles.push(...nestedFiles)
      continue
    }
    if (dirent.isFile() && isCobolFile(filePath)) {
      allFiles.push(filePath)
    }
  }
  return allFiles.sort((left, right) => left.localeCompare(right))
}

const resetTestDirectories = async () => {
  await rm(testCasesPath, { recursive: true, force: true })
  await rm(baselinesPath, { recursive: true, force: true })
  await mkdir(testCasesPath, { recursive: true })
  await mkdir(baselinesPath, { recursive: true })
}

const writeTestFiles = async (allFiles, repoRoot, prefix, seenNames) => {
  for (const filePath of allFiles) {
    const baseName = getTestName(filePath, repoRoot, prefix)
    let testName = baseName
    let suffix = 1
    while (seenNames.has(testName)) {
      suffix += 1
      testName = `${baseName}-${suffix}`
    }
    seenNames.add(testName)
    const content = await readFile(filePath, 'utf8')
    await writeFile(path.join(testCasesPath, `${testName}.cbl`), content)
  }
}

const cloneRepository = async (source, tempRoot) => {
  const repoPath = path.join(tempRoot, source.repoFolder)
  await execFileAsync(
    'git',
    ['clone', '--depth', '1', source.repoUrl, repoPath],
    {
      cwd: tempRoot,
    },
  )
  return repoPath
}

const getSourceFiles = async (source, repoPath) => {
  const sourceFiles = []
  for (const includeDirectory of source.includeDirectories) {
    const includePath = path.join(repoPath, includeDirectory)
    const files = await getAllCobolFiles(includePath)
    sourceFiles.push(...files)
  }
  return sourceFiles.sort((left, right) => left.localeCompare(right))
}

const main = async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'language-basics-cobol-'))
  try {
    await resetTestDirectories()
    const seenNames = new Set()
    const results = []
    for (const source of sources) {
      const repoPath = await cloneRepository(source, tempRoot)
      const allFiles = await getSourceFiles(source, repoPath)
      await writeTestFiles(allFiles, repoPath, source.prefix, seenNames)
      results.push({ name: source.name, count: allFiles.length })
    }
    const total = results.reduce((sum, result) => sum + result.count, 0)
    for (const result of results) {
      console.log(`Imported ${result.count} files from ${result.name}.`)
    }
    console.log(`Copied ${total} COBOL example files into test/cases.`)
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
