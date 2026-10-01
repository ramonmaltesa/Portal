import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const input=JSON.parse(process.env.SITE_PUSH_INPUT||readFileSync(0,"utf8"));
const run=(args,env={})=>{const r=spawnSync("git",args,{stdio:["ignore","pipe","pipe"],encoding:"utf8",env:{...process.env,GIT_CONFIG_COUNT:"1",GIT_CONFIG_KEY_0:"safe.directory",GIT_CONFIG_VALUE_0:process.cwd(),...env}});if(r.status!==0)throw new Error(r.stderr||`git ${args[0]} failed`);return r.stdout.trim()};
try{run(["init","-b",input.branch||"main"])}catch{run(["init"])}
run(["config","user.name","Codex Sites"]);run(["config","user.email","sites@openai.com"]);
run(["add","-A"]);run(["commit","-m","Build portal de oportunidades laborales"]);
try{run(["remote","remove","sites"])}catch{}
run(["remote","add","sites",input.remote]);
const ask=join(process.cwd(),".git","sites-askpass.cmd");writeFileSync(ask,"@echo off\r\nif \"%1\"==\"Username for 'https://github.com': \" (echo x-access-token) else (echo %SITES_PUSH_TOKEN%)\r\n");
run(["push","sites",`HEAD:${input.branch||"main"}`,"--force"],{GIT_ASKPASS:ask,GIT_TERMINAL_PROMPT:"0",SITES_PUSH_TOKEN:input.token});
unlinkSync(ask);console.log(JSON.stringify({commit_sha:run(["rev-parse","HEAD"])}));
