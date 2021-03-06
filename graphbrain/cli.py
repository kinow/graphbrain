from importlib import import_module
import argparse
from termcolor import colored
from . import constants as const


def _show_logo():
    for line in const.ascii_logo.split('\n'):
        print(colored(line[:29], 'cyan'), end='')
        print(colored(line[29:], 'green'))
    print()


def wrapper(fun, command=False, text=None):
    _show_logo()

    parser = argparse.ArgumentParser()

    if command:
        parser.add_argument('command', type=str, help='command to execute')
    parser.add_argument('--hg', type=str,
                        help='hypergraph db', default='gb.hg')
    parser.add_argument('--infile', type=str, help='input file', default=None)
    parser.add_argument('--outfile', type=str,
                        help='output file', default=None)
    parser.add_argument('--indir', type=str,
                        help='input directory', default=None)
    parser.add_argument('--outdir', type=str,
                        help='output directory', default=None)
    parser.add_argument('--url', type=str, help='url', default=None)
    parser.add_argument('--fields', type=str, help='field names', default=None)
    parser.add_argument('--show_namespaces',
                        help='show namespaces', action='store_true')
    parser.add_argument('--lang', type=str, help='language', default='en')
    parser.add_argument('--pattern', type=str, help='edge pattern',
                        default='*')
    parser.add_argument('--agent', type=str, help='agent name', default=None)
    parser.add_argument('--system', type=str, help='agent system file',
                        default=None)
    parser.add_argument('--sequence', type=str, help='sequence name',
                        default=None)
    parser.add_argument('--text', type=str, help='text identifier',
                        default='title')

    args = parser.parse_args()

    if text is None and command:
        text = 'command: {}'.format(args.command)
    if text:
        print(colored('{}\n'.format(text), 'white'))

    if args.hg:
        print('hypergraph: {}'.format(args.hg))
    if args.sequence:
        print('sequence: {}'.format(args.sequence))
    if args.infile:
        print('input file: {}'.format(args.infile))
    if args.outfile:
        print('output file: {}'.format(args.outfile))
    if args.url:
        print('url: {}'.format(args.url))
    if args.agent:
        print('agent: {}'.format(args.agent))
    if args.system:
        print('system: {}'.format(args.system))
    if args.lang:
        print('language: {}'.format(args.lang))

    print()

    fun(args)

    print()


def _cli(args):
    command = args.command
    cmd_module = import_module('graphbrain.commands.{}'.format(command))
    cmd_module.run(args)


def cli():
    wrapper(_cli, command=True)
