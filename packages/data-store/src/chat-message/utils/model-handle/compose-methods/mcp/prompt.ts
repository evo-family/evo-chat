import { IMcpTool } from '@evo/types';

export const MCP_SYSTEM_PROMPT = `In this environment you have access to a set of tools you can use to answer the user's question. \
You can use one tool per message, and will receive the result of that tool use in the user's response. You use tools step-by-step to accomplish a given task, with each tool use informed by the result of the previous tool use.

## Tool Use Formatting

Tool use is formatted using XML-style tags. The tool name is enclosed in opening and closing tags, and each parameter is similarly enclosed within its own set of tags. Here's the structure:

<tool_use>
  <mcp_id>{mcp_id}</mcp_id>
  <tool_name>{tool_name}</tool_name>
  <exe_param>{json_arguments}</exe_param>
</tool_use>

The tool name should be the exact name of the tool you are using, and the arguments should be a JSON object containing the parameters required by that tool. For example:
<tool_use>
  <mcp_id>{mcp_id}</mcp_id>
  <tool_name>python_interpreter</tool_name>
  <exe_param>{"code": "5 + 3 + 1294.678"}</exe_param>
</tool_use>

The user will respond with the result of the tool use, which should be formatted as follows:

<tool_use_result>
  <mcp_id>{mcp_id}</mcp_id>
  <tool_name>{tool_name}</tool_name>
  <result>{result}</result>
</tool_use_result>

The result should be a string, which can represent a file or any other output type. You can use this result as input for the next action.
For example, if the result of the tool use is an image file, you can use it in the next action like this:

<tool_use>
  <mcp_id>{mcp_id}</mcp_id>
  <tool_name>image_transformer</tool_name>
  <exe_param>{"image": "image_1.jpg"}</exe_param>
</tool_use>

Always adhere to this format for the tool use to ensure proper parsing and execution.

## Tool Use Examples
{{ TOOL_USE_EXAMPLES }}

## Tool Use Available Tools
Above example were using notional tools that might not exist for you. You only have access to these tools:
{{ AVAILABLE_TOOLS }}

## Tool Use Rules
Here are the rules you should always follow to solve your task:
1. Always use the right arguments for the tools. Never use variable names as the action arguments, use the value instead.
2. Call a tool only when needed: do not call the search agent if you do not need information, try to solve the task yourself.
3. If no tool call is needed, just answer the question directly.
4. Never re-do a tool call that you previously did with the exact same parameters.
5. For tool use, MARK SURE use XML tag format as shown in the examples above. Do not use any other format.
6. Language Adaptation: You must respond in the same language that the user used in their first message. If the user's first message is in Chinese, always respond in Chinese. If the user's first message is in English, always respond in English. Maintain this language throughout the entire conversation, even if the user switches languages.

# User Instructions
{{ USER_SYSTEM_PROMPT }}

Now Begin! If you solve the task correctly, you will receive a reward of $1,000,000.
`;

export const ToolUseExamples = `
Here are a few examples using notional tools:
---
User: Generate an image of the oldest person in this document.

Assistant: I can use the document_qa tool to find out who the oldest person is in the document.
<tool_use>
  <mcp_id>cdse-ds-19998-sd</mcp_id>
  <tool_name>document_qa</tool_name>
  <exe_param>{"document": "document.pdf", "question": "Who is the oldest person mentioned?"}</exe_param>
</tool_use>

User: <tool_use_result>
  <mcp_id>cdse-ds-19998-sd</mcp_id>
  <tool_name>document_qa</tool_name>
  <result>John Doe, a 55 year old lumberjack living in Newfoundland.</result>
</tool_use_result>

Assistant: I can use the image_generator tool to create a portrait of John Doe.
<tool_use>
  <mcp_id>cdse-ds-19998-sd</mcp_id>
  <tool_name>image_generator</tool_name>
  <exe_param>{"prompt": "A portrait of John Doe, a 55-year-old man living in Canada."}</exe_param>
</tool_use>

User: <tool_use_result>
  <mcp_id>cdse-ds-19998-sd</mcp_id>
  <tool_name>image_generator</tool_name>
  <result>image.png</result>
</tool_use_result>

Assistant: the image is generated as image.png

---
User: "What is the result of the following operation: 5 + 3 + 1294.678?"

Assistant: I can use the python_interpreter tool to calculate the result of the operation.
<tool_use>
  <mcp_id>cdse-ds-19998-sd</mcp_id>
  <tool_name>python_interpreter</tool_name>
  <exe_param>{"code": "5 + 3 + 1294.678"}</exe_param>
</tool_use>

User: <tool_use_result>
  <mcp_id>cdse-ds-19998-sd</mcp_id>
  <tool_name>python_interpreter</tool_name>
  <result>1302.678</result>
</tool_use_result>

Assistant: The result of the operation is 1302.678.

---
User: "Which city has the highest population , Guangzhou or Shanghai?"

Assistant: I can use the search tool to find the population of Guangzhou.
<tool_use>
  <mcp_id>cdse-ds-19998-sd</mcp_id>
  <tool_name>search</tool_name>
  <exe_param>{"query": "Population Guangzhou"}</exe_param>
</tool_use>

User: <tool_use_result>
  <mcp_id>cdse-ds-19998-sd</mcp_id>
  <tool_name>search</tool_name>
  <result>Guangzhou has a population of 15 million inhabitants as of 2021.</result>
</tool_use_result>

Assistant: I can use the search tool to find the population of Shanghai.
<tool_use>
  <mcp_id>cdse-ds-19998-sd</mcp_id>
  <tool_name>search</tool_name>
  <exe_param>{"query": "Population Shanghai"}</exe_param>
</tool_use>

User: <tool_use_result>
  <mcp_id>cdse-ds-19998-sd</mcp_id>
  <tool_name>search</tool_name>
  <result>26 million (2019)</result>
</tool_use_result>
Assistant: The population of Shanghai is 26 million, while Guangzhou has a population of 15 million. Therefore, Shanghai has the highest population.
`;

export const getPromptTools = (tools: IMcpTool[], mcpId: string) => {
  const availableTools = tools
    .map((tool) => {
      return `
<tool>
  <mcp_id>${mcpId}</mcp_id>
  <tool_name>${tool.name}</tool_name>
  <description>${tool.description}</description>
  <exe_param>
    ${tool.inputSchema ? JSON.stringify(tool.inputSchema) : ''}
  </exe_param>
</tool>
`;
    })
    .join('\n');
  return `<tools>
${availableTools}
</tools>`;
};

export const getSystemPrompt = (
  userSystemPrompt: string,
  tools: IMcpTool[],
  mcpId: string
): string => {
  if (tools && tools.length > 0) {
    return MCP_SYSTEM_PROMPT.replace('{{ USER_SYSTEM_PROMPT }}', userSystemPrompt)
      .replace('{{ TOOL_USE_EXAMPLES }}', ToolUseExamples)
      .replace('{{ AVAILABLE_TOOLS }}', getPromptTools(tools, mcpId));
  }

  return userSystemPrompt;
};
