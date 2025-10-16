/*
  8812 Picomotor Dual-Mount Controller (SELECT A|B, MOVE corner A|B|C)
  Wiring summary (matches your harnesses exactly):

  Driver A (Pico A):
    Corner B: STEP D11 -> DB15 pin 7 (StepB), DIR D10 -> pin 14 (DirB)
    Corner C: STEP D9  -> DB15 pin 9 (StepC), DIR D8  -> pin 13 (DirC)
    Corner A: not wired (DB15 pin 8/15 not connected yet)
    GND     -> DB15 pin 11

  Driver B (Pico B):
    Corner A: STEP D6  -> DB15 pin 8 (StepA), DIR D5  -> pin 15 (DirA)
    Corner C: STEP D2  -> DB15 pin 9 (StepC), DIR D3  -> pin 13 (DirC)
    Corner B: not wired
    GND     -> DB15 pin 11

  STEP uses negative-edge (idle HIGH; falling edge = one step).
*/

struct CornerPins { uint8_t dir; uint8_t step; }; // 0 means "not wired"
struct DriverPins { CornerPins A; CornerPins B; CornerPins C; };

// --------- Pin maps (exactly your wiring) ----------
const DriverPins DRIVER_A = {
  /* A */ {0, 0},           // not wired yet
  /* B */ {10, 11},         // DIR D10, STEP D11
  /* C */ { 8,  9}          // DIR D8,  STEP D9
};
const DriverPins DRIVER_B = {
  /* A */ { 5,  6},         // DIR D5,  STEP D6
  /* B */ {0, 0},           // not wired yet
  /* C */ { 3,  2}          // DIR D3,  STEP D2
};

// --------- Active selection ----------
const DriverPins* ACTIVE = &DRIVER_A;
char ACTIVE_NAME = 'A';

// --------- Safety / aux ----------
const uint8_t EMERGENCY_STOP_PIN = 12; // LOW = pressed
const uint8_t CURRENT_SENSE_PIN  = A0; // optional
const uint8_t LED_PIN            = A3;
const uint8_t TRIGGER_OUT_PIN    = A2;

struct MotionParams {
  unsigned int pulse_us = 800;  // step low width
  unsigned int gap_ms   = 6;    // delay between steps
  uint8_t      takeup   = 8;    // pre-steps for stiction
  unsigned int settle_ms= 40;   // settle after move
} mp;

const int   MAX_CURRENT_MA      = 500;
const float CURRENT_MA_PER_CNT  = 1000.0f / 1023.0f;
const unsigned long WATCHDOG_MS = 30000;   // relaxed for bring-up/testing
const bool IDE_MODE             = true;    // disables watchdog if true

struct SystemState {
  long a_pos=0, b_pos=0, c_pos=0;
  bool enabled=false, moving=false;
  bool e_stop=false, overcurrent=false;
  unsigned long last_heartbeat_ms=0;
} st;

inline void heartbeat(){ st.last_heartbeat_ms = millis(); }

bool checkSafety(bool enforceWatchdog=true){
  st.e_stop = (digitalRead(EMERGENCY_STOP_PIN)==LOW);
  int adc = analogRead(CURRENT_SENSE_PIN);
  int mA  = (int)(adc * CURRENT_MA_PER_CNT + 0.5f);
  st.overcurrent = (mA > MAX_CURRENT_MA);

  if (st.e_stop){ Serial.println(F("ERROR: E-STOP")); return false; }
  if (st.overcurrent){ Serial.print(F("ERROR: Overcurrent mA=")); Serial.println(mA); return false; }

  if (enforceWatchdog && !IDE_MODE){
    if (millis() - st.last_heartbeat_ms > WATCHDOG_MS){
      Serial.println(F("ERROR: Watchdog timeout"));
      return false;
    }
  }
  return true;
}

inline bool wired(const CornerPins& p){ return p.dir && p.step; }

inline void setDir(const CornerPins& p, long steps){
  digitalWrite(p.dir, (steps>0) ? HIGH : LOW);
}
inline void pulse(const CornerPins& p){
  digitalWrite(p.step, HIGH);
  delayMicroseconds(2);
  digitalWrite(p.step, LOW);             // falling edge = step
  delayMicroseconds(mp.pulse_us);
  digitalWrite(p.step, HIGH);            // idle HIGH
}

void moveCorner(const CornerPins& p, char name, long steps, long& pos){
  if (!wired(p)){ Serial.print(F("ERROR: Corner ")); Serial.print(name); Serial.println(F(" not wired")); return; }
  if (!st.enabled){ Serial.println(F("ERROR: System not enabled")); return; }
  if (steps==0) return;

  long target = pos + steps;
  st.moving = true;
  setDir(p, steps);

  // take-up
  for (uint8_t i=0;i<mp.takeup;i++){
    if (!checkSafety()) { st.moving=false; return; }
    pulse(p); heartbeat(); delay(mp.gap_ms);
  }
  // main
  for (long i=0, n=labs(steps); i<n; ++i){
    if (!checkSafety()) { st.moving=false; return; }
    pulse(p); heartbeat(); delay(mp.gap_ms);
  }
  delay(mp.settle_ms);
  pos = target;
  st.moving = false;
}

void printHelp(){
  Serial.println(F("=== 8812 Dual-Mount Corner Controller ==="));
  Serial.println(F("SELECT A | SELECT B      (choose Pico A or Pico B)"));
  Serial.println(F("ENABLE / DISABLE / STOP / ZERO"));
  Serial.println(F("MOVE A <steps> | MOVE B <steps> | MOVE C <steps>"));
  Serial.println(F("POSITION | STATUS | SAFETY"));
  Serial.println(F("SET_TIMING <pulse_us> <gap_ms> <takeup> <settle_ms>"));
  Serial.println(F("Notes: Corner not wired -> ERROR. TIP/TILT should be done in app via A/B/C combos."));
}

void handleCommand(String line){
  line.trim(); if (!line.length()) return;
  int sp1 = line.indexOf(' ');
  String cmd = (sp1==-1)? line : line.substring(0, sp1);
  cmd.toUpperCase();

  if (cmd==F("SELECT")){
    String which = line.substring(sp1+1); which.trim(); which.toUpperCase();
    if (which=="A"){ ACTIVE=&DRIVER_A; ACTIVE_NAME='A'; Serial.println(F("OK")); }
    else if (which=="B"){ ACTIVE=&DRIVER_B; ACTIVE_NAME='B'; Serial.println(F("OK")); }
    else { Serial.println(F("ERROR: SELECT needs A or B")); }
    heartbeat(); return;
  }

  if (cmd==F("ENABLE"))  { if (checkSafety(false)){ st.enabled=true; Serial.println(F("OK")); heartbeat(); } else Serial.println(F("ERROR")); return; }
  if (cmd==F("DISABLE")) { st.enabled=false; st.moving=false; Serial.println(F("OK")); heartbeat(); return; }
  if (cmd==F("STOP"))    { st.enabled=false; st.moving=false; digitalWrite(TRIGGER_OUT_PIN,LOW); Serial.println(F("OK")); return; }
  if (cmd==F("ZERO"))    { st.a_pos=st.b_pos=st.c_pos=0; Serial.println(F("OK")); heartbeat(); return; }

  if (cmd==F("POSITION")){
    Serial.print(F("POS A=")); Serial.print(st.a_pos);
    Serial.print(F(" B=")); Serial.print(st.b_pos);
    Serial.print(F(" C=")); Serial.println(st.c_pos);
    return;
  }
  if (cmd==F("STATUS")){
    Serial.print(F("STATUS PICO=")); Serial.print(ACTIVE_NAME);
    Serial.print(F(" ENABLED=")); Serial.print(st.enabled?1:0);
    Serial.print(F(" MOVING="));  Serial.print(st.moving?1:0);
    Serial.print(F(" A=")); Serial.print(st.a_pos);
    Serial.print(F(" B=")); Serial.print(st.b_pos);
    Serial.print(F(" C=")); Serial.println(st.c_pos);
    return;
  }
  if (cmd==F("SAFETY")){
    checkSafety(false);
    Serial.print(F("SAFETY E="));  Serial.print(st.e_stop?1:0);
    Serial.print(F(" OC="));       Serial.println(st.overcurrent?1:0);
    return;
  }

  if (cmd==F("SET_TIMING")){
    long v[4]={0,0,0,0}; int cnt=0, start=sp1+1;
    for (int i=start;i<=line.length() && cnt<4;i++){
      if (i==line.length() || line[i]==' '){ v[cnt++]=line.substring(start,i).toInt(); start=i+1; }
    }
    if (cnt==4){ mp.pulse_us=max(50L,v[0]); mp.gap_ms=max(0L,v[1]); mp.takeup=(uint8_t)max(0L,v[2]); mp.settle_ms=max(0L,v[3]); Serial.println(F("OK")); heartbeat(); }
    else Serial.println(F("ERROR: SET_TIMING needs 4 ints"));
    return;
  }

  if (cmd==F("MOVE")){
    if(!st.enabled){ Serial.println(F("ERROR: System not enabled")); return; }
    int sp2=line.indexOf(' ', sp1+1); if(sp2==-1){ Serial.println(F("ERROR: MOVE syntax")); return; }
    String which = line.substring(sp1+1, sp2); which.toUpperCase();
    long steps = line.substring(sp2+1).toInt();

    if (which==F("A")) { moveCorner(ACTIVE->A, 'A', steps, st.a_pos); if(!st.moving) Serial.println(F("OK")); return; }
    if (which==F("B")) { moveCorner(ACTIVE->B, 'B', steps, st.b_pos); if(!st.moving) Serial.println(F("OK")); return; }
    if (which==F("C")) { moveCorner(ACTIVE->C, 'C', steps, st.c_pos); if(!st.moving) Serial.println(F("OK")); return; }

    Serial.println(F("ERROR: MOVE expects A, B, or C"));
    return;
  }

  if (cmd==F("HELP")) { printHelp(); return; }

  Serial.println(F("ERROR: Unknown command"));
}

void setup(){
  // Configure outputs for all possible motor pins
  const uint8_t OUTS[] = {
    DRIVER_A.A.dir, DRIVER_A.A.step, DRIVER_A.B.dir, DRIVER_A.B.step, DRIVER_A.C.dir, DRIVER_A.C.step,
    DRIVER_B.A.dir, DRIVER_B.A.step, DRIVER_B.B.dir, DRIVER_B.B.step, DRIVER_B.C.dir, DRIVER_B.C.step,
    TRIGGER_OUT_PIN, LED_PIN
  };
  for (uint8_t i=0;i<sizeof(OUTS)/sizeof(OUTS[0]); ++i){
    if (OUTS[i]) pinMode(OUTS[i], OUTPUT);
  }

  // Idle states: DIR LOW, STEP HIGH
  auto idle = [](const CornerPins& p){ if(p.dir) digitalWrite(p.dir,LOW); if(p.step) digitalWrite(p.step,HIGH); };
  idle(DRIVER_A.A); idle(DRIVER_A.B); idle(DRIVER_A.C);
  idle(DRIVER_B.A); idle(DRIVER_B.B); idle(DRIVER_B.C);

  pinMode(EMERGENCY_STOP_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT); digitalWrite(LED_PIN, LOW);
  pinMode(TRIGGER_OUT_PIN, OUTPUT); digitalWrite(TRIGGER_OUT_PIN, LOW);

  Serial.begin(9600);
  while(!Serial){;}
  st.last_heartbeat_ms = millis();

  Serial.println(F("READY"));
  Serial.println(F("8812 Dual-Mount Corner Controller v3.3"));
  Serial.println(F("Type HELP for commands"));
  Serial.println(F("Active Pico: A"));
}

void loop(){
  digitalWrite(LED_PIN, (st.enabled && !st.e_stop) ? HIGH : LOW);

  if (Serial.available()>0){
    String line = Serial.readStringUntil('\n'); line.trim();
    if (line.length()) handleCommand(line);
  }

  checkSafety();
  delay(1);
}
