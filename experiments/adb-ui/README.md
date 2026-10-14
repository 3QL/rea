# ADB UI scope experiment

This draft contains a small, unshipped UIAutomator/input experiment. It uses
the existing `inspect_adb_window` observation supplied by main.
New public UI mutation tools require the maintainer scope decision described in
[CONTRIBUTING.md](../../CONTRIBUTING.md#contribution-scope).

## Observed behavior

- Android 16/API 36 puts `mCurrentFocus` and `mFocusedApp` in display state, outside
  `dumpsys window windows`. Main's reader falls back to `dumpsys window displays`
  when neither focus declaration exists in `windows`. Both queries exclude the
  historical ANR section. The prototype's full-dump parser has been superseded.
- `uiautomator dump --compressed /proc/self/fd/1` streams the hierarchy and a
  status footer without creating a device-side dump file. The projection keeps
  parent relationships, attributes, bounds and the XML digest. Password-marked
  text is excluded; ambiguous controls cannot supply action coordinates.
- A source-built fixture demonstrated a tap counter change, ASCII text entry,
  scrolling and BACK dispatch. Focus is checked before each input. These are
  sequential observations, not an atomic guarantee against UI changes.
- AAPT2 inspects an owned APK snapshot's manifest package, including resource-free
  APKs. Existing CLI/MCP operations install/start those same bytes, inspect focus
  and take a screenshot. Action points must fit both the selected control and
  current screenshot dimensions; swipe endpoints scale with the control's height.
- Exclusive admission is acquired before inspecting package absence. The lease
  holder records its installation attempt before dispatch. Complete inventory is
  required before installing and after cleanup. Retained installer processes
  must settle before package reconciliation; otherwise both package identity and
  the lease remain pending, even if a later process-cleanup retry succeeds.

## Run

Supply compatible existing Android tools, a framework JAR and D8 JAR. Outputs
must be new directories outside the repository; generated APKs and keys are not
source artifacts.

```sh
npm ci
npm run build:cached
node --test experiments/adb-ui/*.test.mjs experiments/command-scope.test.mjs
node experiments/adb-ui/build-fixture.mjs --aapt2 /tools/aapt2 \
  --framework /sdk/android.jar --d8 /sdk/d8.jar --output /lab/ui-fixture
node experiments/adb-ui/verify.mjs --aapt2 /tools/aapt2 --serial emulator-5554 \
  --apk /lab/ui-fixture/ui-probe.apk --output /lab/ui-result
```

The verifier requires an emulator and refuses an already-installed
`com.rea.ui.probe` package. The selected adb server follows the caller's normal
ADB environment and canonical REA binary selection, including blank settings.
CLI and MCP launches use this checkout's module-relative entrypoint, even when
the verifier is launched from another directory. Caller-supplied relative APK
and output paths remain relative to the launch directory.
Workflow MCP calls share the command cancellation signal; cleanup uses a fresh
120-second deadline. Primary, uninstall and close errors are aggregated, with
unresolved owners retained. `fixture-cleanup.json` records the admitted identity
before install and the complete absence observation after cleanup. Success is
reported only after cleanup and session closure finish.

Verifier processes in the same local OS account share a serial/package lease in
that account's home under `.cache/rea/adb-ui-leases/`, independently of worktree,
output directory, `HOME` overrides or ADB server spelling. Equal serials on
different servers are conservatively serialized too. An existing lease refuses
admission; it is never stolen based on PID, age or malformed contents. Cleanup
removes only the file identity this run acquired, after commands, package cleanup
and session closure succeed. Interrupted or unresolved runs leave the lease and
their output journal for recovery: reconcile the recorded processes and device
package before manually removing that lease. Independent ADB clients, other
local accounts and other hosts do not participate; use a dedicated emulator.

## Verification and remaining questions

Linux, adb 34.0.5, Android 16/API 36 x86-64 emulator, Node 24.18.0 and a source-built
probe passed the live experiment. Seven projection tests, ten fixture lifecycle
tests, two cross-process/file-lease tests and three command tests cover malformed XML, out-of-screen points, short
swipes, ambiguous selection, marked-sensitive text, output truncation, package
identity, source replacement, incomplete inventories, uncertain installs,
aggregated failures, late installer settlement, concurrent admission and MCP cancellation. Lifecycle tests use real filesystem
snapshots and in-memory MCP transport with scripted device/inspector outcomes;
they do not establish real-provider behavior. Existing ADB provider/CLI/MCP
regressions also pass. No new public CLI/MCP UI contract is registered yet.

The post-review API 36 run also verified blank `REA_ADB_PATH` fallback and
AAPT2 `2.19-10229193` package admission. A different real APK was refused before
install. An ADB wrapper paused after a real successful install; SIGINT sent only
to the verifier cancelled the host workflow and cleanup proved the package absent.
Main's windows/displays fallback has its own provider regressions; live behavior
on older Android versions remains unverified.

After merging main, two real verifier processes also exercised admission: one
paused before installing and the contender was refused without querying or
changing package state. The owner then committed its install; verifier-only
SIGINT led to complete package absence and lease removal. The updated full UI
workflow also passed. Incomplete native cleanup is covered by scripted stop
results, including a late commit on a later retry, rather than a forced live
ownership failure.

The merged warm-cache workflow took 44.99 s elapsed and 14.19 s host CPU, with an
885,469,184-byte host cgroup memory peak. Payload-exit counters and host process
cleanup were verified; final whole-scope counters disappeared after scope exit.
The observer is included; the external ADB server/emulator and agent-token usage
are unmeasured. The prior 37.93 s / 12.91 s / 867,192,832-byte run used an older
REA runtime and a different emulator instance, so it is not a comparative
baseline. Cold runs remain unmeasured.

The experimental XML input budget is 1 MiB. Production graph/serialization limits,
arbitrary Unicode text, multiple displays, rotation races, accessibility-service
effects and broad application coverage still need design and verification. Scope
review should decide the public hierarchy and single-action interfaces before
those capabilities are integrated.
