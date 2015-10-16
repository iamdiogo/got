import test from 'ava';
import got from '../';
import {createServer} from './_server';

const s = createServer();

s.on('/', (req, res) => {
	res.statusCode = 404;
	res.end();
});

s.on('/test', (req, res) => {
	res.end(req.url);
});

s.on('/?test=wow', (req, res) => {
	res.end(req.url);
});

test.before('arguments - setup', t => {
	s.listen(s.port, () => t.end());
});

test('arguments - url argument is required', async t => {
	try {
		await got();
		t.fail('Exception is not thrown');
	} catch (err) {
		t.regexTest(/Parameter `url` must be a string or object, not undefined/, err.message);
	}
});

test('arguments - accepts url.parse object as first argument', async t => {
	t.is((await got({hostname: s.host, port: s.port, path: '/test'})).body, '/test');
});

test('arguments - overrides querystring from opts', async t => {
	t.is((await got(`${s.url}/?test=doge`, {query: {test: 'wow'}})).body, '/?test=wow');
});

test('arguments - should throw with auth in url', async t => {
	try {
		await got(`https://test:45d3ps453@account.myservice.com/api/token`);
		t.fail('Exception is not thrown');
	} catch (err) {
		t.regexTest(/Basic authentication must be done with auth option/, err.message);
	}
});

test.after('arguments - cleanup', t => {
	s.close();
	t.end();
});