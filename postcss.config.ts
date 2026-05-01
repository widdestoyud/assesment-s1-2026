import path from 'node:path';

const aliasMapping: AliasInterface = {
  '@src': filename => path.resolve(__dirname, `src/${filename}`),
};

export interface AliasInterface {
  [alias: string]: (filename: string) => string;
}

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    'postcss-import': {
      root: path.resolve(__dirname, 'src'),
      skipDuplicates: true,
      resolve: (id: string) => {
        const [aliasName, filename] = id.split('/');
        return aliasMapping[aliasName](filename);
      },
    },
  },
};
