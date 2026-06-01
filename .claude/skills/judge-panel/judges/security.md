LENS: Security & integrity.

Probe: sandbox escape or any weakening of the Docker flags (automatic HIGH); auth bypass; missing
ownership / IDOR checks; removed or loosened `developer`/`teacher` role gates; secret exposure or
logging; injection (command/path/NoSQL); and anti-cheat soundness (can a student forge metrics,
read test answers, or grade arbitrary userIds?). Kids run untrusted code here — err toward HIGH on
anything that widens the trust boundary.
