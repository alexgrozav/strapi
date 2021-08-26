'use strict';

const { join } = require('path');
const getDestinationPrompts = require('./utils/get-destination-prompts');
const getFilePath = require('./utils/get-file-path');

const DEFAULT_TYPES = [
  // advanced types
  'media',

  // scalar types
  'string',
  'text',
  'richtext',
  'json',
  'enumeration',
  'password',
  'email',
  'integer',
  'biginteger',
  'float',
  'decimal',
  'date',
  'time',
  'datetime',
  'timestamp',
  'boolean',

  'relation',
];

module.exports = (plop, rootDir) => {
  // Model generator
  plop.setGenerator('model', {
    description: 'Generate a model for an API',
    prompts: [
      {
        type: 'input',
        name: 'id',
        message: 'Model name',
      },
      {
        type: 'list',
        name: 'kind',
        message: 'Please choose the model type',
        choices: [
          { name: 'Collection Type', value: 'collectionType' },
          { name: 'Singe Type', value: 'singleType' },
        ],
      },
      ...getDestinationPrompts('model'),
      {
        type: 'confirm',
        name: 'useDraftAndPublish',
        message: 'Use draft and publish?',
      },
      {
        type: 'recursive',
        message: 'Add attribute?',
        name: 'attributes',
        prompts: [
          {
            type: 'input',
            name: 'attributeName',
            message: 'Name of attribute',
          },
          {
            type: 'list',
            name: 'attributeType',
            message: 'What type of attribute',
            pageSize: DEFAULT_TYPES.length,
            choices: DEFAULT_TYPES.map(type => {
              return { name: type, value: type };
            }),
          },
        ],
      },
    ],
    actions: answers => {
      const attributes = answers.attributes.reduce((object, answer) => {
        // Rest/spread properties are not supported until Node.js 8.3.0.
        // The configured version range is '>=8.0.0'
        return Object.assign(
          object,
          { [answer.attributeName]: { type: answer.attributeType } },
          {}
        );
      }, {});

      const filePath = getFilePath(answers.destination);

      return [
        {
          type: 'add',
          path: join(rootDir, `${filePath}/models/{{id}}.js`),
          templateFile: 'templates/model.js.hbs',
        },
        {
          type: 'add',
          path: join(rootDir, `${filePath}/models/{{id}}.settings.json`),
          templateFile: 'templates/model.settings.json.hbs',
        },
        {
          type: 'modify',
          path: join(rootDir, `${filePath}/models/{{id}}.settings.json`),
          transform: template => {
            const temp = JSON.parse(template);
            temp.attributes = attributes;
            return JSON.stringify(temp, null, 2);
          },
        },
      ];
    },
  });
};
