// dev-tools/run.js
export async function run(label, fn) {
    console.log(`\n🧪 Running: ${label}`);
    console.log('='.repeat(40));

    try {
        const result = await fn();

        if (result !== undefined) {
            console.log('\n📦 Result:');
            console.dir(result, { depth: null });
        }

        console.log('\n✅ Done.');
    } catch (err) {
        console.error('\n💥 Error:');
        console.error(err?.stack || err);
    }

    console.log('='.repeat(40));
}
