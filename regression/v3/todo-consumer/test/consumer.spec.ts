import path from 'node:path';
import { Matchers, PactV3, XmlBuilder } from '@pact-foundation/pact';
import { beforeAll, describe, expect, it } from 'vitest';
import TodoApp from '../src/todo';

const { string, eachLike, integer, boolean, atLeastOneLike, timestamp } =
  Matchers;
const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('Pact V3', () => {
  const provider = new PactV3({
    consumer: 'TodoApp',
    provider: 'TodoServiceV3',
    logLevel: LOG_LEVEL,
    dir: path.resolve(__dirname, '..', 'pacts'),
  });

  describe('when there are a list of projects', () => {
    describe('and there is a valid user session', () => {
      describe('with JSON request', () => {
        beforeAll(() => {
          provider
            .given('i have a list of projects')
            .uponReceiving('a request for projects')
            .withRequest({
              method: 'GET',
              path: '/projects',
              query: { from: 'today' },
              headers: { Accept: 'application/json' },
            })
            .willRespondWith({
              status: 200,
              headers: { 'Content-Type': 'application/json' },
              body: eachLike({
                id: integer(1),
                name: string('Project 1'),
                due: timestamp(
                  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
                  '2016-02-11T09:46:56.023Z',
                ),
                tasks: atLeastOneLike(
                  {
                    id: integer(),
                    name: string('Do the laundry'),
                    done: boolean(true),
                  },
                  4,
                ),
              }),
            });
        });

        it('generates a list of TODOs for the main screen', () => {
          return provider.executeTest((mockserver) => {
            console.log('In Test Function', mockserver);
            return TodoApp.setUrl(mockserver.url)
              .getProjects()
              .then((projects) => {
                expect(Array.isArray(projects)).toBe(true);
                expect(projects).toHaveLength(1);
                expect(projects[0].id).toBe(1);
                expect(Array.isArray(projects[0].tasks)).toBe(true);
                expect(projects[0].tasks).toHaveLength(4);
              });
          });
        });
      });
    });

    describe('with XML requests', () => {
      beforeAll(() => {
        provider
          .given('i have a list of projects')
          .uponReceiving('a request for projects in XML')
          .withRequest({
            method: 'GET',
            path: '/projects',
            query: { from: 'today' },
            // TODO: update once https://github.com/pact-foundation/pact-reference/issues/238 has been fixed
            // headers: { Accept: regex('application/.*xml', 'application/xml') },
            headers: { Accept: 'application/xml' },
          })
          .willRespondWith({
            status: 200,
            headers: {
              // TODO: update once https://github.com/pact-foundation/pact-reference/issues/238 has been fixed
              // 'Content-Type': regex(
              //   'application/.*xml(;.*)?',
              //   'application/xml'
              // ),
              'Content-Type': 'application/todo+xml; charset=utf-8',
            },
            body: new XmlBuilder('1.0', 'UTF-8', 'ns1:projects').build((el) => {
              el.setAttributes({
                id: '1234',
                'xmlns:ns1': 'http://some.namespace/and/more/stuff',
              });
              el.eachLike(
                'ns1:project',
                {
                  id: integer(1),
                  type: 'activity',
                  name: string('Project 1'),
                  // TODO: implement XML generators
                  // due: timestamp(
                  //   "yyyy-MM-dd'T'HH:mm:ss.SZ",
                  //   "2016-02-11T09:46:56.023Z"
                  // ),
                },
                (project) => {
                  project.appendElement('ns1:tasks', {}, (task) => {
                    task.eachLike(
                      'ns1:task',
                      {
                        id: integer(1),
                        name: string('Task 1'),
                        done: boolean(true),
                      },
                      null,
                      { examples: 5 },
                    );
                  });
                },
                { examples: 2 },
              );
            }),
          });
      });

      it('generates a list of TODOs for the main screen', () => {
        return provider.executeTest((mockserver) => {
          console.log('In Test Function', mockserver);
          return TodoApp.setUrl(mockserver.url)
            .getProjects('xml')
            .then((projects) => {
              expect(Array.isArray(projects['ns1:project'])).toBe(true);
              expect(projects['ns1:project']).toHaveLength(2);
              expect(projects['ns1:project'][0]['@_id']).toBe('1');
              expect(
                Array.isArray(
                  projects['ns1:project'][0]['ns1:tasks']['ns1:task'],
                ),
              ).toBe(true);
              expect(
                projects['ns1:project'][0]['ns1:tasks']['ns1:task'],
              ).toHaveLength(5);
            });
        });
      });
    });

    describe('with image uploads', () => {
      beforeAll(() => {
        provider
          .given('i have a project', { id: '1001', name: 'Home Chores' })
          .uponReceiving('a request to store an image against the project')
          .withRequestBinaryFile(
            { method: 'POST', path: '/projects/1001/images' },
            'image/jpeg',
            path.resolve(__dirname, 'example.jpg'),
          )
          .willRespondWith({ status: 201 });
      });

      it('stores the image against the project', async () => {
        const result = await provider.executeTest((mockserver) => {
          console.log('In Test Function', mockserver);
          return TodoApp.setUrl(mockserver.url).postImage(
            1001,
            path.resolve(__dirname, 'example.jpg'),
          );
        });
        console.log('result from runTest', result.status);
        expect(result.status).toBe(201);
        return result;
      });
    });
  });
});
