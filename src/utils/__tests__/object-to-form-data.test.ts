/**
 * @jest-environment jsdom
 */
import objectToFormData from '../object-to-form-data';

it('should produce bracketed keys for nested objects', () => {
    const formData = objectToFormData({ a: { b: 'c' } });

    expect(formData.get('a[b]')).toBe('c');
});

it('should produce deeply bracketed keys', () => {
    const formData = objectToFormData({ a: { b: { c: 'd' } } });

    expect(formData.get('a[b][c]')).toBe('d');
});

it('should produce indexed keys for arrays', () => {
    const formData = objectToFormData({ a: ['x', 'y'] });

    expect(formData.get('a[0]')).toBe('x');
    expect(formData.get('a[1]')).toBe('y');
});

it('should serialize dates as ISO strings', () => {
    const date = new Date(Date.UTC(2022, 0, 2, 3, 4, 5));

    const formData = objectToFormData({ createdAt: date });

    expect(formData.get('createdAt')).toBe(date.toISOString());
});

it('should serialize null and undefined as empty strings', () => {
    const formData = objectToFormData({ a: null, b: undefined });

    expect(formData.get('a')).toBe('');
    expect(formData.get('b')).toBe('');
});

it('should stringify primitives', () => {
    const formData = objectToFormData({ a: 1, b: true });

    expect(formData.get('a')).toBe('1');
    expect(formData.get('b')).toBe('true');
});

it('should keep blobs untouched', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });

    const formData = objectToFormData({ file: blob });

    const value = formData.get('file');

    expect(value).toBeInstanceOf(Blob);
    expect((value as Blob).type).toBe('text/plain');
});

it('should throw on circular references', () => {
    const object: any = { a: 1 };
    object.self = object;

    expect(() => objectToFormData(object)).toThrow('objectToFormData: circular reference detected');
});

it('should allow the same object to appear twice without cycles', () => {
    const shared = { name: 'shared' };

    const formData = objectToFormData({ a: shared, b: shared });

    expect(formData.get('a[name]')).toBe('shared');
    expect(formData.get('b[name]')).toBe('shared');
});
