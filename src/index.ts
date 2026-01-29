#!/usr/bin/env node

import { Command } from "commander";
import { ingestCommand } from "./commands/ingest.js";
import { queryCommand } from "./commands/query.js";
import { searchCommand } from "./commands/search.js";

const program = new Command();

program
  .name("rag-sandbox")
  .description("RAG sandbox for learning and experimentation")
  .version("1.0.0");

program.addCommand(ingestCommand);
program.addCommand(queryCommand);
program.addCommand(searchCommand);

program.parse();
