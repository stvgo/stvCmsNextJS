"use client"

import { useCallback } from "react"
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react"
import type * as Monaco from 'monaco-editor'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  placeholder?: string
}

// Snippets para cada lenguaje
const LANGUAGE_SNIPPETS: Record<string, Array<{label: string, insertText: string, documentation: string}>> = {
  python: [
    { label: 'def', insertText: 'def ${1:function_name}(${2:params}):\n\t${3:pass}', documentation: 'Define a function' },
    { label: 'class', insertText: 'class ${1:ClassName}:\n\tdef __init__(self${2:, params}):\n\t\t${3:pass}', documentation: 'Define a class' },
    { label: 'if', insertText: 'if ${1:condition}:\n\t${2:pass}', documentation: 'If statement' },
    { label: 'for', insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}', documentation: 'For loop' },
    { label: 'while', insertText: 'while ${1:condition}:\n\t${2:pass}', documentation: 'While loop' },
    { label: 'try', insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as e:\n\t${3:pass}', documentation: 'Try-except block' },
    { label: 'with', insertText: 'with ${1:expression} as ${2:variable}:\n\t${3:pass}', documentation: 'Context manager' },
    { label: 'lambda', insertText: 'lambda ${1:x}: ${2:x}', documentation: 'Lambda function' },
    { label: 'list_comp', insertText: '[${1:x} for ${2:x} in ${3:iterable}]', documentation: 'List comprehension' },
    { label: 'dict_comp', insertText: '{${1:key}: ${2:value} for ${3:item} in ${4:iterable}}', documentation: 'Dict comprehension' },
    { label: 'import', insertText: 'import ${1:module}', documentation: 'Import module' },
    { label: 'from_import', insertText: 'from ${1:module} import ${2:name}', documentation: 'From import' },
    { label: 'async_def', insertText: 'async def ${1:function_name}(${2:params}):\n\t${3:pass}', documentation: 'Async function' },
    { label: 'await', insertText: 'await ${1:coroutine}', documentation: 'Await expression' },
  ],
  go: [
    { label: 'func', insertText: 'func ${1:name}(${2:params}) ${3:returnType} {\n\t${4}\n}', documentation: 'Function declaration' },
    { label: 'main', insertText: 'func main() {\n\t${1}\n}', documentation: 'Main function' },
    { label: 'struct', insertText: 'type ${1:Name} struct {\n\t${2:field} ${3:type}\n}', documentation: 'Struct declaration' },
    { label: 'interface', insertText: 'type ${1:Name} interface {\n\t${2:Method}(${3:params}) ${4:returnType}\n}', documentation: 'Interface declaration' },
    { label: 'if', insertText: 'if ${1:condition} {\n\t${2}\n}', documentation: 'If statement' },
    { label: 'iferr', insertText: 'if err != nil {\n\t${1:return err}\n}', documentation: 'Error check' },
    { label: 'for', insertText: 'for ${1:i} := 0; ${1:i} < ${2:n}; ${1:i}++ {\n\t${3}\n}', documentation: 'For loop' },
    { label: 'forr', insertText: 'for ${1:i}, ${2:v} := range ${3:slice} {\n\t${4}\n}', documentation: 'For range loop' },
    { label: 'switch', insertText: 'switch ${1:expression} {\ncase ${2:value}:\n\t${3}\ndefault:\n\t${4}\n}', documentation: 'Switch statement' },
    { label: 'go', insertText: 'go func() {\n\t${1}\n}()', documentation: 'Goroutine' },
    { label: 'defer', insertText: 'defer ${1:function}()', documentation: 'Defer statement' },
    { label: 'make', insertText: 'make(${1:type}, ${2:size})', documentation: 'Make slice/map/channel' },
    { label: 'channel', insertText: '${1:ch} := make(chan ${2:type})', documentation: 'Create channel' },
  ],
  rust: [
    { label: 'fn', insertText: 'fn ${1:name}(${2:params}) -> ${3:ReturnType} {\n\t${4}\n}', documentation: 'Function declaration' },
    { label: 'main', insertText: 'fn main() {\n\t${1}\n}', documentation: 'Main function' },
    { label: 'struct', insertText: 'struct ${1:Name} {\n\t${2:field}: ${3:Type},\n}', documentation: 'Struct declaration' },
    { label: 'impl', insertText: 'impl ${1:Type} {\n\t${2}\n}', documentation: 'Implementation block' },
    { label: 'enum', insertText: 'enum ${1:Name} {\n\t${2:Variant},\n}', documentation: 'Enum declaration' },
    { label: 'trait', insertText: 'trait ${1:Name} {\n\tfn ${2:method}(&self)${3};\n}', documentation: 'Trait declaration' },
    { label: 'if', insertText: 'if ${1:condition} {\n\t${2}\n}', documentation: 'If statement' },
    { label: 'match', insertText: 'match ${1:expression} {\n\t${2:pattern} => ${3},\n\t_ => ${4},\n}', documentation: 'Match expression' },
    { label: 'for', insertText: 'for ${1:item} in ${2:iterator} {\n\t${3}\n}', documentation: 'For loop' },
    { label: 'loop', insertText: 'loop {\n\t${1}\n}', documentation: 'Infinite loop' },
    { label: 'let', insertText: 'let ${1:name} = ${2:value};', documentation: 'Variable binding' },
    { label: 'letmut', insertText: 'let mut ${1:name} = ${2:value};', documentation: 'Mutable binding' },
    { label: 'vec', insertText: 'vec![${1}]', documentation: 'Vector macro' },
    { label: 'println', insertText: 'println!("${1}");', documentation: 'Print with newline' },
    { label: 'option', insertText: 'Option<${1:T}>', documentation: 'Option type' },
    { label: 'result', insertText: 'Result<${1:T}, ${2:E}>', documentation: 'Result type' },
  ],
  java: [
    { label: 'class', insertText: 'public class ${1:ClassName} {\n\t${2}\n}', documentation: 'Class declaration' },
    { label: 'main', insertText: 'public static void main(String[] args) {\n\t${1}\n}', documentation: 'Main method' },
    { label: 'method', insertText: 'public ${1:void} ${2:methodName}(${3:params}) {\n\t${4}\n}', documentation: 'Method declaration' },
    { label: 'private', insertText: 'private ${1:void} ${2:methodName}(${3:params}) {\n\t${4}\n}', documentation: 'Private method' },
    { label: 'interface', insertText: 'public interface ${1:InterfaceName} {\n\t${2}\n}', documentation: 'Interface declaration' },
    { label: 'if', insertText: 'if (${1:condition}) {\n\t${2}\n}', documentation: 'If statement' },
    { label: 'ifelse', insertText: 'if (${1:condition}) {\n\t${2}\n} else {\n\t${3}\n}', documentation: 'If-else statement' },
    { label: 'for', insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}', documentation: 'For loop' },
    { label: 'foreach', insertText: 'for (${1:Type} ${2:item} : ${3:collection}) {\n\t${4}\n}', documentation: 'For-each loop' },
    { label: 'while', insertText: 'while (${1:condition}) {\n\t${2}\n}', documentation: 'While loop' },
    { label: 'try', insertText: 'try {\n\t${1}\n} catch (${2:Exception} e) {\n\t${3}\n}', documentation: 'Try-catch block' },
    { label: 'sout', insertText: 'System.out.println(${1});', documentation: 'Print to console' },
    { label: 'switch', insertText: 'switch (${1:expression}) {\n\tcase ${2:value}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${4}\n}', documentation: 'Switch statement' },
  ],
  c: [
    { label: 'main', insertText: 'int main(int argc, char *argv[]) {\n\t${1}\n\treturn 0;\n}', documentation: 'Main function' },
    { label: 'func', insertText: '${1:void} ${2:function_name}(${3:params}) {\n\t${4}\n}', documentation: 'Function declaration' },
    { label: 'struct', insertText: 'struct ${1:name} {\n\t${2:type} ${3:field};\n};', documentation: 'Struct declaration' },
    { label: 'if', insertText: 'if (${1:condition}) {\n\t${2}\n}', documentation: 'If statement' },
    { label: 'for', insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}', documentation: 'For loop' },
    { label: 'while', insertText: 'while (${1:condition}) {\n\t${2}\n}', documentation: 'While loop' },
    { label: 'switch', insertText: 'switch (${1:expression}) {\n\tcase ${2:value}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${4}\n}', documentation: 'Switch statement' },
    { label: 'printf', insertText: 'printf("${1}\\n"${2});', documentation: 'Print formatted' },
    { label: 'scanf', insertText: 'scanf("${1}", &${2});', documentation: 'Read input' },
    { label: 'include', insertText: '#include <${1:stdio.h}>', documentation: 'Include header' },
    { label: 'define', insertText: '#define ${1:NAME} ${2:value}', documentation: 'Define macro' },
    { label: 'malloc', insertText: '(${1:type}*)malloc(${2:size} * sizeof(${1:type}))', documentation: 'Allocate memory' },
  ],
  cpp: [
    { label: 'main', insertText: 'int main() {\n\t${1}\n\treturn 0;\n}', documentation: 'Main function' },
    { label: 'class', insertText: 'class ${1:ClassName} {\npublic:\n\t${2}\nprivate:\n\t${3}\n};', documentation: 'Class declaration' },
    { label: 'func', insertText: '${1:void} ${2:function_name}(${3:params}) {\n\t${4}\n}', documentation: 'Function declaration' },
    { label: 'template', insertText: 'template <typename ${1:T}>\n${2:void} ${3:function_name}(${4:params}) {\n\t${5}\n}', documentation: 'Template function' },
    { label: 'if', insertText: 'if (${1:condition}) {\n\t${2}\n}', documentation: 'If statement' },
    { label: 'for', insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}', documentation: 'For loop' },
    { label: 'forr', insertText: 'for (auto& ${1:item} : ${2:container}) {\n\t${3}\n}', documentation: 'Range-based for' },
    { label: 'while', insertText: 'while (${1:condition}) {\n\t${2}\n}', documentation: 'While loop' },
    { label: 'cout', insertText: 'std::cout << ${1} << std::endl;', documentation: 'Print to console' },
    { label: 'cin', insertText: 'std::cin >> ${1};', documentation: 'Read input' },
    { label: 'vector', insertText: 'std::vector<${1:type}> ${2:name};', documentation: 'Vector declaration' },
    { label: 'map', insertText: 'std::map<${1:key}, ${2:value}> ${3:name};', documentation: 'Map declaration' },
    { label: 'include', insertText: '#include <${1:iostream}>', documentation: 'Include header' },
    { label: 'namespace', insertText: 'namespace ${1:name} {\n\t${2}\n}', documentation: 'Namespace declaration' },
    { label: 'try', insertText: 'try {\n\t${1}\n} catch (const std::exception& e) {\n\t${2}\n}', documentation: 'Try-catch block' },
    { label: 'lambda', insertText: '[${1:capture}](${2:params}) {\n\t${3}\n}', documentation: 'Lambda expression' },
    { label: 'unique_ptr', insertText: 'std::unique_ptr<${1:Type}> ${2:name} = std::make_unique<${1:Type}>(${3});', documentation: 'Unique pointer' },
    { label: 'shared_ptr', insertText: 'std::shared_ptr<${1:Type}> ${2:name} = std::make_shared<${1:Type}>(${3});', documentation: 'Shared pointer' },
  ],
  csharp: [
    { label: 'class', insertText: 'public class ${1:ClassName}\n{\n\t${2}\n}', documentation: 'Class declaration' },
    { label: 'main', insertText: 'public static void Main(string[] args)\n{\n\t${1}\n}', documentation: 'Main method' },
    { label: 'method', insertText: 'public ${1:void} ${2:MethodName}(${3:params})\n{\n\t${4}\n}', documentation: 'Method declaration' },
    { label: 'prop', insertText: 'public ${1:Type} ${2:PropertyName} { get; set; }', documentation: 'Auto property' },
    { label: 'propfull', insertText: 'private ${1:Type} _${2:fieldName};\npublic ${1:Type} ${3:PropertyName}\n{\n\tget { return _${2:fieldName}; }\n\tset { _${2:fieldName} = value; }\n}', documentation: 'Full property' },
    { label: 'interface', insertText: 'public interface ${1:IInterfaceName}\n{\n\t${2}\n}', documentation: 'Interface declaration' },
    { label: 'if', insertText: 'if (${1:condition})\n{\n\t${2}\n}', documentation: 'If statement' },
    { label: 'for', insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++)\n{\n\t${3}\n}', documentation: 'For loop' },
    { label: 'foreach', insertText: 'foreach (var ${1:item} in ${2:collection})\n{\n\t${3}\n}', documentation: 'Foreach loop' },
    { label: 'try', insertText: 'try\n{\n\t${1}\n}\ncatch (Exception ex)\n{\n\t${2}\n}', documentation: 'Try-catch block' },
    { label: 'async', insertText: 'public async Task${1:<T>} ${2:MethodName}(${3:params})\n{\n\t${4}\n}', documentation: 'Async method' },
    { label: 'cw', insertText: 'Console.WriteLine(${1});', documentation: 'Console write line' },
    { label: 'linq', insertText: 'var ${1:result} = ${2:collection}.Where(x => ${3:condition}).Select(x => ${4:x});', documentation: 'LINQ query' },
    { label: 'using', insertText: 'using (var ${1:resource} = ${2:new Resource()})\n{\n\t${3}\n}', documentation: 'Using statement' },
  ],
  ruby: [
    { label: 'def', insertText: 'def ${1:method_name}(${2:params})\n\t${3}\nend', documentation: 'Method definition' },
    { label: 'class', insertText: 'class ${1:ClassName}\n\tdef initialize(${2:params})\n\t\t${3}\n\tend\nend', documentation: 'Class definition' },
    { label: 'module', insertText: 'module ${1:ModuleName}\n\t${2}\nend', documentation: 'Module definition' },
    { label: 'if', insertText: 'if ${1:condition}\n\t${2}\nend', documentation: 'If statement' },
    { label: 'ifelse', insertText: 'if ${1:condition}\n\t${2}\nelse\n\t${3}\nend', documentation: 'If-else statement' },
    { label: 'unless', insertText: 'unless ${1:condition}\n\t${2}\nend', documentation: 'Unless statement' },
    { label: 'each', insertText: '${1:collection}.each do |${2:item}|\n\t${3}\nend', documentation: 'Each loop' },
    { label: 'map', insertText: '${1:collection}.map { |${2:item}| ${3:item} }', documentation: 'Map block' },
    { label: 'select', insertText: '${1:collection}.select { |${2:item}| ${3:condition} }', documentation: 'Select block' },
    { label: 'begin', insertText: 'begin\n\t${1}\nrescue ${2:StandardError} => e\n\t${3}\nend', documentation: 'Begin-rescue block' },
    { label: 'attr', insertText: 'attr_accessor :${1:name}', documentation: 'Attribute accessor' },
    { label: 'do', insertText: 'do |${1:params}|\n\t${2}\nend', documentation: 'Do block' },
    { label: 'puts', insertText: 'puts ${1}', documentation: 'Print to console' },
  ],
  php: [
    { label: 'function', insertText: 'function ${1:functionName}(${2:params}) {\n\t${3}\n}', documentation: 'Function declaration' },
    { label: 'class', insertText: 'class ${1:ClassName} {\n\tpublic function __construct(${2:params}) {\n\t\t${3}\n\t}\n}', documentation: 'Class declaration' },
    { label: 'method', insertText: 'public function ${1:methodName}(${2:params}): ${3:void} {\n\t${4}\n}', documentation: 'Method declaration' },
    { label: 'if', insertText: 'if (${1:condition}) {\n\t${2}\n}', documentation: 'If statement' },
    { label: 'foreach', insertText: 'foreach (${1:$array} as ${2:$key} => ${3:$value}) {\n\t${4}\n}', documentation: 'Foreach loop' },
    { label: 'for', insertText: 'for ($$${1:i} = 0; $$${1:i} < ${2:count}; $$${1:i}++) {\n\t${3}\n}', documentation: 'For loop' },
    { label: 'try', insertText: 'try {\n\t${1}\n} catch (Exception $$e) {\n\t${2}\n}', documentation: 'Try-catch block' },
    { label: 'echo', insertText: 'echo ${1};', documentation: 'Echo output' },
    { label: 'array', insertText: '$$${1:array} = [${2}];', documentation: 'Array declaration' },
    { label: 'interface', insertText: 'interface ${1:InterfaceName} {\n\t${2}\n}', documentation: 'Interface declaration' },
    { label: 'trait', insertText: 'trait ${1:TraitName} {\n\t${2}\n}', documentation: 'Trait declaration' },
    { label: 'namespace', insertText: 'namespace ${1:App\\\\Name};', documentation: 'Namespace declaration' },
    { label: 'use', insertText: 'use ${1:Namespace\\\\Class};', documentation: 'Use statement' },
  ],
  swift: [
    { label: 'func', insertText: 'func ${1:functionName}(${2:params}) -> ${3:ReturnType} {\n\t${4}\n}', documentation: 'Function declaration' },
    { label: 'class', insertText: 'class ${1:ClassName} {\n\tinit(${2:params}) {\n\t\t${3}\n\t}\n}', documentation: 'Class declaration' },
    { label: 'struct', insertText: 'struct ${1:StructName} {\n\t${2:let property: Type}\n}', documentation: 'Struct declaration' },
    { label: 'enum', insertText: 'enum ${1:EnumName} {\n\tcase ${2:caseName}\n}', documentation: 'Enum declaration' },
    { label: 'protocol', insertText: 'protocol ${1:ProtocolName} {\n\t${2}\n}', documentation: 'Protocol declaration' },
    { label: 'if', insertText: 'if ${1:condition} {\n\t${2}\n}', documentation: 'If statement' },
    { label: 'iflet', insertText: 'if let ${1:unwrapped} = ${2:optional} {\n\t${3}\n}', documentation: 'Optional binding' },
    { label: 'guard', insertText: 'guard ${1:condition} else {\n\t${2:return}\n}', documentation: 'Guard statement' },
    { label: 'guardlet', insertText: 'guard let ${1:unwrapped} = ${2:optional} else {\n\t${3:return}\n}', documentation: 'Guard let binding' },
    { label: 'for', insertText: 'for ${1:item} in ${2:collection} {\n\t${3}\n}', documentation: 'For-in loop' },
    { label: 'switch', insertText: 'switch ${1:value} {\ncase ${2:pattern}:\n\t${3}\ndefault:\n\t${4}\n}', documentation: 'Switch statement' },
    { label: 'closure', insertText: '{ (${1:params}) -> ${2:ReturnType} in\n\t${3}\n}', documentation: 'Closure expression' },
    { label: 'print', insertText: 'print(${1})', documentation: 'Print to console' },
    { label: 'async', insertText: 'func ${1:functionName}(${2:params}) async throws -> ${3:ReturnType} {\n\t${4}\n}', documentation: 'Async function' },
  ],
  kotlin: [
    { label: 'fun', insertText: 'fun ${1:functionName}(${2:params}): ${3:ReturnType} {\n\t${4}\n}', documentation: 'Function declaration' },
    { label: 'main', insertText: 'fun main() {\n\t${1}\n}', documentation: 'Main function' },
    { label: 'class', insertText: 'class ${1:ClassName}(${2:params}) {\n\t${3}\n}', documentation: 'Class declaration' },
    { label: 'data', insertText: 'data class ${1:ClassName}(\n\tval ${2:property}: ${3:Type}\n)', documentation: 'Data class' },
    { label: 'object', insertText: 'object ${1:ObjectName} {\n\t${2}\n}', documentation: 'Object declaration' },
    { label: 'interface', insertText: 'interface ${1:InterfaceName} {\n\t${2}\n}', documentation: 'Interface declaration' },
    { label: 'if', insertText: 'if (${1:condition}) {\n\t${2}\n}', documentation: 'If statement' },
    { label: 'when', insertText: 'when (${1:value}) {\n\t${2:pattern} -> ${3}\n\telse -> ${4}\n}', documentation: 'When expression' },
    { label: 'for', insertText: 'for (${1:item} in ${2:collection}) {\n\t${3}\n}', documentation: 'For loop' },
    { label: 'forEach', insertText: '${1:collection}.forEach { ${2:item} ->\n\t${3}\n}', documentation: 'ForEach loop' },
    { label: 'try', insertText: 'try {\n\t${1}\n} catch (e: ${2:Exception}) {\n\t${3}\n}', documentation: 'Try-catch block' },
    { label: 'let', insertText: '${1:nullable}?.let { ${2:it} ->\n\t${3}\n}', documentation: 'Let scope function' },
    { label: 'apply', insertText: '${1:object}.apply {\n\t${2}\n}', documentation: 'Apply scope function' },
    { label: 'suspend', insertText: 'suspend fun ${1:functionName}(${2:params}): ${3:ReturnType} {\n\t${4}\n}', documentation: 'Suspend function' },
    { label: 'println', insertText: 'println(${1})', documentation: 'Print to console' },
  ],
  scala: [
    { label: 'def', insertText: 'def ${1:functionName}(${2:params}): ${3:ReturnType} = {\n\t${4}\n}', documentation: 'Method definition' },
    { label: 'main', insertText: 'def main(args: Array[String]): Unit = {\n\t${1}\n}', documentation: 'Main method' },
    { label: 'class', insertText: 'class ${1:ClassName}(${2:params}) {\n\t${3}\n}', documentation: 'Class declaration' },
    { label: 'case', insertText: 'case class ${1:ClassName}(${2:field}: ${3:Type})', documentation: 'Case class' },
    { label: 'object', insertText: 'object ${1:ObjectName} {\n\t${2}\n}', documentation: 'Object declaration' },
    { label: 'trait', insertText: 'trait ${1:TraitName} {\n\t${2}\n}', documentation: 'Trait declaration' },
    { label: 'if', insertText: 'if (${1:condition}) {\n\t${2}\n}', documentation: 'If statement' },
    { label: 'match', insertText: '${1:value} match {\n\tcase ${2:pattern} => ${3}\n\tcase _ => ${4}\n}', documentation: 'Pattern matching' },
    { label: 'for', insertText: 'for (${1:item} <- ${2:collection}) {\n\t${3}\n}', documentation: 'For comprehension' },
    { label: 'foryield', insertText: 'for {\n\t${1:item} <- ${2:collection}\n} yield ${3:item}', documentation: 'For yield' },
    { label: 'val', insertText: 'val ${1:name}: ${2:Type} = ${3:value}', documentation: 'Immutable value' },
    { label: 'var', insertText: 'var ${1:name}: ${2:Type} = ${3:value}', documentation: 'Mutable variable' },
    { label: 'try', insertText: 'try {\n\t${1}\n} catch {\n\tcase e: ${2:Exception} => ${3}\n}', documentation: 'Try-catch block' },
    { label: 'println', insertText: 'println(${1})', documentation: 'Print to console' },
    { label: 'lambda', insertText: '(${1:params}) => ${2:body}', documentation: 'Lambda expression' },
  ],
  html: [
    { label: 'html5', insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t${2}\n</body>\n</html>', documentation: 'HTML5 boilerplate' },
    { label: 'div', insertText: '<div class="${1:class}">\n\t${2}\n</div>', documentation: 'Div element' },
    { label: 'a', insertText: '<a href="${1:url}">${2:text}</a>', documentation: 'Anchor element' },
    { label: 'img', insertText: '<img src="${1:url}" alt="${2:alt}">', documentation: 'Image element' },
    { label: 'ul', insertText: '<ul>\n\t<li>${1}</li>\n</ul>', documentation: 'Unordered list' },
    { label: 'ol', insertText: '<ol>\n\t<li>${1}</li>\n</ol>', documentation: 'Ordered list' },
    { label: 'table', insertText: '<table>\n\t<thead>\n\t\t<tr>\n\t\t\t<th>${1:Header}</th>\n\t\t</tr>\n\t</thead>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td>${2:Data}</td>\n\t\t</tr>\n\t</tbody>\n</table>', documentation: 'Table element' },
    { label: 'form', insertText: '<form action="${1:action}" method="${2:post}">\n\t${3}\n</form>', documentation: 'Form element' },
    { label: 'input', insertText: '<input type="${1:text}" name="${2:name}" id="${3:id}">', documentation: 'Input element' },
    { label: 'button', insertText: '<button type="${1:button}">${2:Click me}</button>', documentation: 'Button element' },
    { label: 'script', insertText: '<script src="${1:script.js}"></script>', documentation: 'Script tag' },
    { label: 'link', insertText: '<link rel="stylesheet" href="${1:style.css}">', documentation: 'CSS link' },
    { label: 'meta', insertText: '<meta name="${1:name}" content="${2:content}">', documentation: 'Meta tag' },
  ],
  css: [
    { label: 'flex', insertText: 'display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};', documentation: 'Flexbox container' },
    { label: 'grid', insertText: 'display: grid;\ngrid-template-columns: ${1:repeat(3, 1fr)};\ngap: ${2:1rem};', documentation: 'Grid container' },
    { label: 'media', insertText: '@media (${1:max-width}: ${2:768px}) {\n\t${3}\n}', documentation: 'Media query' },
    { label: 'var', insertText: 'var(--${1:variable-name})', documentation: 'CSS variable' },
    { label: 'root', insertText: ':root {\n\t--${1:variable}: ${2:value};\n}', documentation: 'CSS root variables' },
    { label: 'transition', insertText: 'transition: ${1:all} ${2:0.3s} ${3:ease};', documentation: 'Transition property' },
    { label: 'transform', insertText: 'transform: ${1:translateX}(${2:0});', documentation: 'Transform property' },
    { label: 'animation', insertText: 'animation: ${1:name} ${2:1s} ${3:ease} ${4:infinite};', documentation: 'Animation property' },
    { label: 'keyframes', insertText: '@keyframes ${1:name} {\n\t0% {\n\t\t${2}\n\t}\n\t100% {\n\t\t${3}\n\t}\n}', documentation: 'Keyframes rule' },
    { label: 'center', insertText: 'display: flex;\njustify-content: center;\nalign-items: center;', documentation: 'Center content' },
    { label: 'shadow', insertText: 'box-shadow: ${1:0} ${2:4px} ${3:6px} ${4:rgba(0, 0, 0, 0.1)};', documentation: 'Box shadow' },
    { label: 'gradient', insertText: 'background: linear-gradient(${1:to right}, ${2:#color1}, ${3:#color2});', documentation: 'Linear gradient' },
    { label: 'pseudo', insertText: '&::${1:before} {\n\tcontent: "";\n\t${2}\n}', documentation: 'Pseudo element' },
  ],
  sql: [
    { label: 'select', insertText: 'SELECT ${1:*}\nFROM ${2:table_name}\nWHERE ${3:condition};', documentation: 'Select statement' },
    { label: 'insert', insertText: 'INSERT INTO ${1:table_name} (${2:columns})\nVALUES (${3:values});', documentation: 'Insert statement' },
    { label: 'update', insertText: 'UPDATE ${1:table_name}\nSET ${2:column} = ${3:value}\nWHERE ${4:condition};', documentation: 'Update statement' },
    { label: 'delete', insertText: 'DELETE FROM ${1:table_name}\nWHERE ${2:condition};', documentation: 'Delete statement' },
    { label: 'create', insertText: 'CREATE TABLE ${1:table_name} (\n\t${2:id} INT PRIMARY KEY,\n\t${3:column} ${4:VARCHAR(255)}\n);', documentation: 'Create table' },
    { label: 'alter', insertText: 'ALTER TABLE ${1:table_name}\nADD ${2:column_name} ${3:data_type};', documentation: 'Alter table' },
    { label: 'drop', insertText: 'DROP TABLE ${1:table_name};', documentation: 'Drop table' },
    { label: 'join', insertText: 'SELECT ${1:*}\nFROM ${2:table1}\nINNER JOIN ${3:table2} ON ${2:table1}.${4:id} = ${3:table2}.${5:foreign_id};', documentation: 'Inner join' },
    { label: 'leftjoin', insertText: 'SELECT ${1:*}\nFROM ${2:table1}\nLEFT JOIN ${3:table2} ON ${2:table1}.${4:id} = ${3:table2}.${5:foreign_id};', documentation: 'Left join' },
    { label: 'groupby', insertText: 'SELECT ${1:column}, COUNT(*)\nFROM ${2:table_name}\nGROUP BY ${1:column};', documentation: 'Group by' },
    { label: 'orderby', insertText: 'ORDER BY ${1:column} ${2:ASC};', documentation: 'Order by' },
    { label: 'index', insertText: 'CREATE INDEX ${1:index_name}\nON ${2:table_name} (${3:column});', documentation: 'Create index' },
    { label: 'view', insertText: 'CREATE VIEW ${1:view_name} AS\nSELECT ${2:*}\nFROM ${3:table_name}\nWHERE ${4:condition};', documentation: 'Create view' },
  ],
  bash: [
    { label: 'shebang', insertText: '#!/bin/bash\n\n${1}', documentation: 'Bash shebang' },
    { label: 'if', insertText: 'if [[ ${1:condition} ]]; then\n\t${2}\nfi', documentation: 'If statement' },
    { label: 'ifelse', insertText: 'if [[ ${1:condition} ]]; then\n\t${2}\nelse\n\t${3}\nfi', documentation: 'If-else statement' },
    { label: 'for', insertText: 'for ${1:item} in ${2:list}; do\n\t${3}\ndone', documentation: 'For loop' },
    { label: 'fornum', insertText: 'for ((${1:i}=0; ${1:i}<${2:10}; ${1:i}++)); do\n\t${3}\ndone', documentation: 'Numeric for loop' },
    { label: 'while', insertText: 'while [[ ${1:condition} ]]; do\n\t${2}\ndone', documentation: 'While loop' },
    { label: 'case', insertText: 'case ${1:variable} in\n\t${2:pattern})\n\t\t${3}\n\t\t;;\n\t*)\n\t\t${4}\n\t\t;;\nesac', documentation: 'Case statement' },
    { label: 'function', insertText: '${1:function_name}() {\n\t${2}\n}', documentation: 'Function definition' },
    { label: 'read', insertText: 'read -p "${1:Enter value: }" ${2:variable}', documentation: 'Read input' },
    { label: 'echo', insertText: 'echo "${1:message}"', documentation: 'Echo output' },
    { label: 'var', insertText: '${1:VARIABLE}="${2:value}"', documentation: 'Variable assignment' },
    { label: 'array', insertText: '${1:ARRAY}=(${2:item1} ${3:item2})', documentation: 'Array declaration' },
  ],
  json: [
    { label: 'object', insertText: '{\n\t"${1:key}": "${2:value}"\n}', documentation: 'JSON object' },
    { label: 'array', insertText: '[\n\t${1}\n]', documentation: 'JSON array' },
    { label: 'keyvalue', insertText: '"${1:key}": "${2:value}"', documentation: 'Key-value pair' },
    { label: 'keyobj', insertText: '"${1:key}": {\n\t${2}\n}', documentation: 'Key with object value' },
    { label: 'keyarr', insertText: '"${1:key}": [\n\t${2}\n]', documentation: 'Key with array value' },
    { label: 'package', insertText: '{\n\t"name": "${1:package-name}",\n\t"version": "${2:1.0.0}",\n\t"description": "${3:description}",\n\t"main": "${4:index.js}",\n\t"scripts": {\n\t\t"test": "echo \\"Error: no test specified\\" && exit 1"\n\t},\n\t"keywords": [],\n\t"author": "${5:author}",\n\t"license": "${6:ISC}"\n}', documentation: 'package.json template' },
  ],
  yaml: [
    { label: 'key', insertText: '${1:key}: ${2:value}', documentation: 'Key-value pair' },
    { label: 'list', insertText: '${1:key}:\n  - ${2:item}', documentation: 'List' },
    { label: 'nested', insertText: '${1:parent}:\n  ${2:child}: ${3:value}', documentation: 'Nested object' },
    { label: 'multiline', insertText: '${1:key}: |\n  ${2:line1}\n  ${3:line2}', documentation: 'Multiline string' },
    { label: 'docker', insertText: 'version: "3"\nservices:\n  ${1:app}:\n    image: ${2:image-name}\n    ports:\n      - "${3:3000}:${4:3000}"', documentation: 'Docker compose template' },
    { label: 'github', insertText: 'name: ${1:CI}\non:\n  push:\n    branches: [${2:main}]\njobs:\n  ${3:build}:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3', documentation: 'GitHub Actions template' },
    { label: 'k8s-deploy', insertText: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${1:deployment-name}\nspec:\n  replicas: ${2:1}\n  selector:\n    matchLabels:\n      app: ${3:app-name}\n  template:\n    metadata:\n      labels:\n        app: ${3:app-name}\n    spec:\n      containers:\n      - name: ${4:container-name}\n        image: ${5:image-name}', documentation: 'Kubernetes Deployment' },
  ],
  javascript: [
    { label: 'func', insertText: 'function ${1:functionName}(${2:params}) {\n\t${3}\n}', documentation: 'Function declaration' },
    { label: 'arrow', insertText: 'const ${1:functionName} = (${2:params}) => {\n\t${3}\n}', documentation: 'Arrow function' },
    { label: 'async', insertText: 'async function ${1:functionName}(${2:params}) {\n\t${3}\n}', documentation: 'Async function' },
    { label: 'asyncarrow', insertText: 'const ${1:functionName} = async (${2:params}) => {\n\t${3}\n}', documentation: 'Async arrow function' },
    { label: 'class', insertText: 'class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${3}\n\t}\n}', documentation: 'Class declaration' },
    { label: 'if', insertText: 'if (${1:condition}) {\n\t${2}\n}', documentation: 'If statement' },
    { label: 'for', insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3}\n}', documentation: 'For loop' },
    { label: 'forof', insertText: 'for (const ${1:item} of ${2:iterable}) {\n\t${3}\n}', documentation: 'For-of loop' },
    { label: 'foreach', insertText: '${1:array}.forEach((${2:item}) => {\n\t${3}\n})', documentation: 'ForEach loop' },
    { label: 'map', insertText: '${1:array}.map((${2:item}) => ${3:item})', documentation: 'Array map' },
    { label: 'filter', insertText: '${1:array}.filter((${2:item}) => ${3:condition})', documentation: 'Array filter' },
    { label: 'reduce', insertText: '${1:array}.reduce((${2:acc}, ${3:item}) => {\n\t${4}\n}, ${5:initialValue})', documentation: 'Array reduce' },
    { label: 'try', insertText: 'try {\n\t${1}\n} catch (error) {\n\t${2}\n}', documentation: 'Try-catch block' },
    { label: 'promise', insertText: 'new Promise((resolve, reject) => {\n\t${1}\n})', documentation: 'Promise' },
    { label: 'fetch', insertText: 'fetch(\'${1:url}\')\n\t.then(response => response.json())\n\t.then(data => {\n\t\t${2}\n\t})\n\t.catch(error => console.error(error))', documentation: 'Fetch API' },
    { label: 'log', insertText: 'console.log(${1})', documentation: 'Console log' },
  ],
  typescript: [
    { label: 'interface', insertText: 'interface ${1:InterfaceName} {\n\t${2:property}: ${3:type};\n}', documentation: 'Interface declaration' },
    { label: 'type', insertText: 'type ${1:TypeName} = ${2:type};', documentation: 'Type alias' },
    { label: 'func', insertText: 'function ${1:functionName}(${2:params}: ${3:type}): ${4:ReturnType} {\n\t${5}\n}', documentation: 'Typed function' },
    { label: 'arrow', insertText: 'const ${1:functionName} = (${2:params}: ${3:type}): ${4:ReturnType} => {\n\t${5}\n}', documentation: 'Typed arrow function' },
    { label: 'async', insertText: 'async function ${1:functionName}(${2:params}: ${3:type}): Promise<${4:ReturnType}> {\n\t${5}\n}', documentation: 'Async typed function' },
    { label: 'class', insertText: 'class ${1:ClassName} {\n\tprivate ${2:property}: ${3:type};\n\n\tconstructor(${4:params}: ${5:type}) {\n\t\t${6}\n\t}\n}', documentation: 'Typed class' },
    { label: 'enum', insertText: 'enum ${1:EnumName} {\n\t${2:Value1},\n\t${3:Value2},\n}', documentation: 'Enum declaration' },
    { label: 'generic', insertText: 'function ${1:functionName}<${2:T}>(${3:param}: ${2:T}): ${2:T} {\n\t${4}\n}', documentation: 'Generic function' },
    { label: 'readonly', insertText: 'readonly ${1:property}: ${2:type};', documentation: 'Readonly property' },
    { label: 'partial', insertText: 'Partial<${1:Type}>', documentation: 'Partial type' },
    { label: 'pick', insertText: 'Pick<${1:Type}, ${2:Keys}>', documentation: 'Pick type' },
    { label: 'omit', insertText: 'Omit<${1:Type}, ${2:Keys}>', documentation: 'Omit type' },
    { label: 'record', insertText: 'Record<${1:Keys}, ${2:Type}>', documentation: 'Record type' },
  ],
}

export function CodeEditor({ value, onChange, language, placeholder }: CodeEditorProps) {
  const handleEditorChange = useCallback((value: string | undefined) => {
    onChange(value ?? "")
  }, [onChange])

  const handleBeforeMount: BeforeMount = (monaco) => {
    // Define custom dark theme
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editor.selectionBackground': '#264f78',
        'editorLineNumber.foreground': '#4a4a4a',
        'editorLineNumber.activeForeground': '#888888',
        'editorCursor.foreground': '#aeafad',
        'editor.inactiveSelectionBackground': '#3a3d41',
      },
    })

    // Register completion providers for ALL languages at once
    Object.entries(LANGUAGE_SNIPPETS).forEach(([lang, snippets]) => {
      monaco.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: (model: Parameters<Monaco.languages.CompletionItemProvider['provideCompletionItems']>[0], position: Parameters<Monaco.languages.CompletionItemProvider['provideCompletionItems']>[1]) => {
          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          }

          const suggestions = snippets.map((snippet) => ({
            label: snippet.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: snippet.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: snippet.documentation,
            range: range,
            sortText: `0_${snippet.label}`,
          }))

          return { suggestions }
        },
      })
    })
  }

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Set custom theme
    monaco.editor.setTheme('custom-dark')
    
    // Configure editor settings
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'line',
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
      padding: { top: 12, bottom: 12 },
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'off',
      bracketPairColorization: { enabled: true },
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      acceptSuggestionOnEnter: 'on',
    })
  }

  return (
    <div className="monaco-editor-container relative">
      <Editor
        height="200px"
        language={language}
        value={value}
        onChange={handleEditorChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        loading={
          <div className="flex items-center justify-center h-[200px] bg-[#0a0a0a] text-gray-500 text-sm">
            Loading editor...
          </div>
        }
        options={{
          automaticLayout: true,
        }}
      />
      {!value && placeholder && (
        <div className="absolute top-3 left-14 text-gray-600 text-sm pointer-events-none font-mono">
          {placeholder}
        </div>
      )}
    </div>
  )
}
