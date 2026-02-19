using System;
using System.Diagnostics;
using Microsoft.Win32;

namespace ClaudeProtocolHandler
{
    class Program
    {
        static int Main(string[] args)
        {
            try
            {
                // 检查是否为安装命令
                if (args.Length > 0 && args[0] == "--install")
                {
                    InstallProtocolHandler();
                    return 0;
                }

                // 检查是否为卸载命令
                if (args.Length > 0 && args[0] == "--uninstall")
                {
                    UninstallProtocolHandler();
                    return 0;
                }

                // 处理协议激活
                if (args.Length > 0 && args[0].StartsWith("claude://"))
                {
                    return HandleActivation(args[0]);
                }

                Console.WriteLine("Usage:");
                Console.WriteLine("  --install    - Install claude:// protocol handler");
                Console.WriteLine("  --uninstall  - Uninstall claude:// protocol handler");
                return 1;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("Error: " + ex.Message);
                return 1;
            }
        }

        static int HandleActivation(string uri)
        {
            try
            {
                // 解析 URL 参数（手动解析）
                string sessionId = "";
                int queryIndex = uri.IndexOf('?');
                if (queryIndex > 0)
                {
                    string queryString = uri.Substring(queryIndex + 1);
                    string[] paramsList = queryString.Split('&');
                    foreach (string param in paramsList)
                    {
                        string[] kv = param.Split('=');
                        if (kv.Length == 2 && kv[0] == "session")
                        {
                            sessionId = Uri.UnescapeDataString(kv[1]);
                            break;
                        }
                    }
                }

                // 获取当前终端窗口
                BringClaudeTerminalToFront(sessionId);

                Console.WriteLine("Activated: " + uri);
                if (!string.IsNullOrEmpty(sessionId))
                {
                    Console.WriteLine("Session: " + sessionId);
                }

                return 0;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("Error handling activation: " + ex.Message);
                return 1;
            }
        }

        static void BringClaudeTerminalToFront(string sessionId)
        {
            try
            {
                // 查找 Claude Code 相关的终端进程
                // 先尝试常见的终端应用
                string[] terminalProcesses = new[] { "WindowsTerminal", "WindowsTerminal", "ConEmuC64", "ConEmuC" };

                foreach (string processName in terminalProcesses)
                {
                    try
                    {
                        Process[] processes = Process.GetProcessesByName(processName);
                        foreach (Process proc in processes)
                        {
                            try
                            {
                                // 检查进程窗口标题
                                string mainWindowTitle = proc.MainWindowTitle;
                                if (!string.IsNullOrEmpty(mainWindowTitle))
                                {
                                    // 如果指定了会话 ID，尝试匹配
                                    if (!string.IsNullOrEmpty(sessionId))
                                    {
                                        if (mainWindowTitle.Contains(sessionId))
                                        {
                                            ActivateWindow(proc);
                                            return;
                                        }
                                    }
                                    else
                                    {
                                        // 没有指定会话 ID，找任何 Claude 相关的窗口
                                        if (mainWindowTitle.Contains("Claude") || mainWindowTitle.Contains("claude"))
                                        {
                                            ActivateWindow(proc);
                                            return;
                                        }
                                    }
                                }
                            }
                            catch
                            {
                                // 忽略无法访问的进程
                                continue;
                            }
                        }
                    }
                    catch
                    {
                        continue;
                    }
                }

                // 如果没有找到特定终端，尝试查找 VS Code（因为很多人在 VS Code 中使用 Claude）
                try
                {
                    Process[] codeProcesses = Process.GetProcessesByName("Code");
                    foreach (Process proc in codeProcesses)
                    {
                        try
                        {
                            string mainWindowTitle = proc.MainWindowTitle;
                            if (!string.IsNullOrEmpty(mainWindowTitle))
                            {
                                ActivateWindow(proc);
                                return;
                            }
                        }
                        catch
                        {
                            continue;
                        }
                    }
                }
                catch
                {
                    // 忽略错误
                }

                Console.WriteLine("Warning: Could not find a Claude-related window to activate.");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("Warning: Could not bring window to front: " + ex.Message);
            }
        }

        static void ActivateWindow(Process proc)
        {
            IntPtr hWnd = proc.MainWindowHandle;
            if (hWnd != IntPtr.Zero)
            {
                // 如果窗口最小化，恢复它
                if (IsIconic(hWnd))
                {
                    ShowWindow(hWnd, 9); // SW_RESTORE
                }
                // 设置为前台窗口
                SetForegroundWindow(hWnd);
            }
        }

        static void InstallProtocolHandler()
        {
            try
            {
                // 获取当前可执行文件路径
                string exePath = Process.GetCurrentProcess().MainModule.FileName;

                // 注册协议
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\claude"))
                {
                    key.SetValue(null, "URL:Claude Code Protocol");
                    key.SetValue("URL Protocol", "");
                }

                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\claude\DefaultIcon"))
                {
                    key.SetValue(null, "\"" + exePath + "\",0");
                }

                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\claude\shell\open\command"))
                {
                    key.SetValue(null, "\"" + exePath + "\" \"%1\"");
                }

                Console.WriteLine("Protocol handler installed successfully.");
                Console.WriteLine("You may need to restart your browser or application to recognize the protocol.");
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to install protocol handler: " + ex.Message, ex);
            }
        }

        static void UninstallProtocolHandler()
        {
            try
            {
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Classes\claude");
                Console.WriteLine("Protocol handler uninstalled successfully.");
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to uninstall protocol handler: " + ex.Message, ex);
            }
        }

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        static extern bool SetForegroundWindow(IntPtr hWnd);

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        static extern bool IsIconic(IntPtr hWnd);
    }
}
