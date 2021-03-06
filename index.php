<?php
namespace KVSun\Index;
use const \KVSun\Consts\{CSP as CSP_POLICY};
use function \KVSun\Functions\{build_dom};
use \shgysk8zer0\Core\{CSP};

if (in_array(PHP_SAPI, ['cli', 'cli-server'])) {
	require_once __DIR__ . DIRECTORY_SEPARATOR . 'autoloader.php';
}

(new CSP(CSP_POLICY))();

exit(build_dom()->saveHTML());
