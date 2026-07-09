LENS: Correctness.

Hunt for: logic errors, wrong or missing edge cases, race conditions, operator-precedence bugs
(`&&` binding before `||`), off-by-one, unhandled promise rejections / swallowed errors, incorrect
async ordering, and read-modify-write that loses updates under concurrency. Trace each changed
function's call path with Read/Grep before ruling. Known Coderunner hazards to probe: Mongo
findOne→mutate→save without atomic `$inc`/`$addToSet`; boolean test chains mixing `&&` and `||`;
double-processing of code on the grade path. A real logic bug on a user path is HIGH.
