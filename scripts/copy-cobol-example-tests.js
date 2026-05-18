// @ts-nocheck

import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path, { dirname, extname, relative } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const repoUrl = 'https://github.com/shamrice/COBOL-Examples'
const supportedExtensions = new Set(['.cbl', '.cob', '.cobol', '.cpy'])
const testCasesPath = path.join(root, 'test', 'cases')
const baselinesPath = path.join(root, 'test', 'baselines')

const isCobolFile = (filePath) => {
  return supportedExtensions.has(extname(filePath).toLowerCase())
}

const sanitizeSegment = (value) => {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
}

const getTestName = (filePath, repoRoot) => {
  const relativePath = relative(repoRoot, filePath)
  const parts = relativePath.split(path.sep).filter(Boolean)
  const normalized = parts.map(sanitizeSegment).filter(Boolean).join('--')
  return `cobol-examples--${normalized}`
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

const writeTestFiles = async (allFiles, repoRoot) => {
  const seenNames = new Set()
  for (const filePath of allFiles) {
    const baseName = getTestName(filePath, repoRoot)
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

const main = async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'language-basics-cobol-'))
  const repoPath = path.join(tempRoot, 'COBOL-Examples')
  try {
    await resetTestDirectories()
    await execFileAsync('git', ['clone', '--depth', '1', repoUrl, repoPath], {
      cwd: tempRoot,
    })
    const allFiles = await getAllCobolFiles(repoPath)
    await writeTestFiles(allFiles, repoPath)
    console.log(`Copied ${allFiles.length} COBOL example files into test/cases.`)
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
