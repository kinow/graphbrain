import logging
import progressbar
from graphbrain.cognition.agent import Agent
from graphbrain.op import create_op


def read_paragraphs(file_name):
    with open(file_name, 'r') as f:
        for line in f.readlines():
            paragraph = line.strip()
            if len(paragraph) > 0:
                yield paragraph


class TxtParser(Agent):
    def __init__(self, name, progress_bar=True, logging_level=logging.INFO):
        super().__init__(
            name, progress_bar=progress_bar, logging_level=logging_level)
        self.edges = 0

    def on_start(self):
        if not self.system.get_sequence(self):
            raise RuntimeError('Sequence name must be specified.')

    def parse_text(self, infile, parser, sequence):
        pos = 0

        paragraphs = list(read_paragraphs(infile))

        if self.progress_bar:
            pbar = progressbar.ProgressBar(max_value=len(paragraphs)).start()
        else:
            pbar = None

        for i, paragraph in enumerate(paragraphs):
            parse_results = parser.parse(paragraph)
            for parse in parse_results['parses']:
                main_edge = parse['resolved_corefs']

                # add main edge
                if main_edge:
                    # attach text to edge
                    text = parse['text']
                    attr = {'text': text}

                    # print('main edge: {}'.format(main_edge.to_str()))
                    yield create_op(main_edge, sequence=sequence, position=pos,
                                    attributes=attr)
                    pos += 1

                    # add extra edges
                    for edge in parse['extra_edges']:
                        yield create_op(edge)
            for edge in parse_results['inferred_edges']:
                # print('inferred edge: {}'.format(edge.to_str()))
                yield create_op(edge, count=True)
            if self.progress_bar:
                pbar.update(i)

        if self.progress_bar:
            pbar.finish()

    def run(self):
        infile = self.system.get_infile(self)
        parser = self.system.get_parser(self)
        sequence = self.system.get_sequence(self)

        for op in self.parse_text(infile, parser, sequence):
            if op['sequence'] == sequence:
                self.edges += 1
            yield op

    def report(self):
        rep_str = ('edges found: {}'.format(self.edges))
        return '{}\n\n{}'.format(rep_str, super().report())
