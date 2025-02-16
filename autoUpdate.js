const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const BASE_DIRECTORY = path.resolve(__dirname, 'pages');
const API_YAML_DIR = path.join(BASE_DIRECTORY, 'openapi');
const SWAGGER_PATH = path.join(BASE_DIRECTORY, 'swagger-initializer.js');

const STANDARD_CHARSET = 'utf-8';
const URLS_REGEX = /urls: \[(.*?)]/s;

/**
 * 파일을 동기적으로 읽어온다.
 *
 * @param filePath 읽어올 파일 경로
 * @param encoding 파일 인코딩 (기본값: UTF-8)
 * @returns {*} 파일 내용
 */
const readFileSync = (filePath, encoding = STANDARD_CHARSET) => {
    try {
        return fs.readFileSync(filePath, encoding);
    } catch (error) {
        console.error(`Error reading file at ${filePath}:`, error);
        process.exit(1);
    }
}

/**
 * 디렉토리를 동기적으로 읽어온다.
 *
 * @param directoryPath 읽어올 디렉토리 경로
 * @returns {*} 디렉토리 내용
 */
const readDirectorySync = directoryPath => {
    try {
        return fs.readdirSync(directoryPath);
    } catch (error) {
        console.error(`Error reading directory at ${directoryPath}:`, error);
        process.exit(1);
    }
}

/**
 * Swagger Content에서 기존 URL 배열을 추출한다.
 *
 * @param swaggerContent Swagger Content
 * @returns {any|*[]} 기존 URL 배열
 */
const extractExistingUrls = swaggerContent => {
    const urlsMatch = swaggerContent.match(URLS_REGEX);
    return urlsMatch?.[1]
        ? JSON.parse(`[${urlsMatch[1].replace(/url: /g, '"url": ').replace(/name: /g, '"name": ')}]`)
        : [];
}

/**
 * Yaml 파일을 순회하며 기존 urls에 없는 URL 항목을 추가한다.
 *
 * @param existingUrls 기존 URL 배열
 * @param yamlDirectory Yaml 파일이 위치한 디렉토리
 */
const updateUrlsWithYaml = (existingUrls, yamlDirectory) => {
    const yamlFiles = readDirectorySync(yamlDirectory).filter(file => file.endsWith('.yaml'));

    yamlFiles.forEach(file => {
        const filePath = path.join(yamlDirectory, file);
        const fileContent = readFileSync(filePath);
        const parsedYaml = yaml.load(fileContent);

        const title = parsedYaml.info?.title || path.basename(file, '.yaml');
        const url = `./openapi/${file}`;

        if (!existingUrls.some(existingUrl => existingUrl.url === url)) {
            existingUrls.push({url, name: title});
        }
    });

    return existingUrls;
}

/**
 * 최신화된 URL 배열을 Swagger Content에 반영한다.
 *
 * @param swaggerPath Swagger Content 경로
 * @param updatedUrls 최신화된 URL 배열
 */
const updateSwaggerContent = (swaggerPath, updatedUrls) => {
    let swaggerContent = readFileSync(swaggerPath);
    const newUrlsString = updatedUrls
        .map(entry => `{url: "${entry.url}", name: "${entry.name}"}`)
        .join(', ');
    swaggerContent = swaggerContent.replace(/urls: \[(.*?)]/s, `urls: [${newUrlsString}]`);
    try {
        fs.writeFileSync(swaggerPath, swaggerContent, STANDARD_CHARSET);
        console.log('API Docs URLs updated successfully');
    } catch (error) {
        console.error('Failed to write swagger-initializer.js', error);
        process.exit(1);
    }
}

const main = () => {
    const swaggerContent = readFileSync(SWAGGER_PATH);
    const existingUrls = extractExistingUrls(swaggerContent);
    const updatedUrls = updateUrlsWithYaml(existingUrls, API_YAML_DIR);
    updateSwaggerContent(SWAGGER_PATH, updatedUrls);
}

main();