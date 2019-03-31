import sys
from itertools import repeat
from collections import namedtuple
import logging
import spacy
from graphbrain import *


logging.basicConfig(stream=sys.stderr, level=logging.WARNING)


deps_arg_roles = {
    'nsubj': 's',      # subject
    'nsubjpass': 'p',  # passive subject
    'agent': 'a',      # agent
    'acomp': 'c',      # subject complement
    'attr': 'c',       # subject complement
    'dobj': 'o',       # direct object
    'prt': 'o',        # direct object
    'dative': 'i',     # indirect object
    'advcl': 'x',      # specifier
    'prep': 'x',       # specifier
    'npadvmod': 'x',   # specifier
    'parataxis': 't',  # parataxis
    'intj': 'j',       # interjection
    'xcomp': 'r',      # clausal complement
    'ccomp': 'r'       # clausal complement
}


def token_head_type(token):
    head = token.head
    if head and head != token:
        return token_type(head)
    else:
        return ''


def is_noun(token):
    return token.tag_[:2] == 'NN'


def is_verb(token):
    tag = token.tag_
    if len(tag) > 0:
        return token.tag_[0] == 'V'
    else:
        return False


def is_infinitive(token):
    return token.tag_ == 'VB'


def is_compound(token):
    return token.dep_ == 'compound'


def token_type(token, head=False):
    if is_noun(token):
        return 'c'

    dep = token.dep_
    head_type = token_head_type(token)
    if len(head_type) > 1:
        head_subtype = head_type[1]
    else:
        head_subtype = ''
    if len(head_type) > 0:
        head_type = head_type[0]

    if dep == 'ROOT':
        if token.pos_ == 'VERB':  # TODO: generalize!
            return 'p'
        else:
            return 'c'
    elif dep in {'appos', 'attr', 'compound', 'dative', 'dep', 'dobj',
                 'nsubj', 'nsubjpass', 'oprd', 'pobj', 'meta'}:
        return 'c'
    elif dep in {'advcl', 'ccomp', 'csubj', 'csubjpass', 'parataxis'}:
        return 'p'
    elif dep == 'relcl':
        if is_verb(token):
            return 'pr'
        else:
            return 'c'
    elif dep in {'acl', 'pcomp', 'xcomp'}:
        if token.tag_ == 'IN':
            return 'a'
        else:
            return 'pc'
    elif dep in {'amod', 'det', 'npadvmod', 'nummod', 'nmod', 'preconj',
                 'predet'}:
        return 'm'
    elif dep in {'aux', 'auxpass', 'expl', 'prt', 'quantmod'}:
        if token.n_lefts + token.n_rights == 0:
            return 'a'
        else:
            return 'x'
    elif dep == 'cc':
        if head_type == 'p':
            return 'pm'
        else:
            return 'b'
    elif dep == 'case':
        if token.head.dep_ == 'poss':
            return 'bp'
        else:
            return 'b'
    elif dep == 'neg':
        return 'an'
    elif dep == 'agent':
        return 'x'
    elif dep in {'intj', 'punct'}:
        return ''
    elif dep == 'advmod':
        if token.head.dep_ == 'advcl':
            return 't'
        elif head_type == 'p':
            return 'a'
        elif head_type in {'m', 'x', 't', 'b'}:
            return 'w'
        else:
            return 'm'
    elif dep == 'poss':
        if is_noun(token):
            return 'c'
        else:
            return 'mp'
    elif dep == 'prep':
        if head_type == 'p':
            return 't'
        else:
            return 'b'
    elif dep == 'conj':
        if head_type == 'p' and is_verb(token):
            return 'p'
        else:
            return 'c'
    elif dep == 'mark':
        if head_type == 'p' and head_subtype != 'c':
            return 'x'
        else:
            return 'b'
    elif dep == 'acomp':
        if is_verb(token):
            return 'x'
        else:
            return 'c'
    else:
        #  error / warning ?
        pass


def is_relative_concept(token):
    return token.dep_ == 'appos'


def arg_type(token):
    return deps_arg_roles.get(token.dep_, '?')


def insert_after_predicate(targ, orig):
    targ_type = entity_type(targ)
    if targ_type[0] == 'p':
        return (targ, orig)
    elif targ_type[0] == 'r':
        if targ_type == 'rm':
            inner_rel = insert_after_predicate(targ[1], orig)
            return (targ[0], inner_rel) + tuple(targ[2:])
        else:
            return insert_first_argument(targ, orig)
    else:
        # TODO: error / warning
        print('ERROR %s %s' % (targ, orig))
        return targ


def nest_predicate(inner, outer, before):
    if entity_type(inner) == 'rm':
        first_rel = nest_predicate(inner[1], outer, before)
        return (inner[0], first_rel) + tuple(inner[2:])
    elif is_atom(inner) or entity_type(inner)[0] == 'p':
        return outer, inner
    else:
        return ((outer, inner[0]),) + inner[1:]


class Parser(object):
    def __init__(self, lang, pos=False, lemmas=False):
        self.lang = lang
        self.pos = pos
        self.lemmas = lemmas
        self.atom2token = {}

        if lang == 'en':
            self.nlp = spacy.load('en_core_web_lg')
        elif lang == 'fr':
            self.nlp = spacy.load('fr_core_news_md')
        else:
            raise RuntimeError('unkown language: %s' % lang)

        # named tuple used to pass parser state internally
        self._ParseState = namedtuple('_ParseState',
                                      ['extra_edges', 'tokens', 'child_tokens',
                                       'positions', 'children', 'entities'])

    def _post_process(self, entity):
        if is_atom(entity):
            token = self.atom2token.get(entity)
            if token:
                ent_type = self.atom2token[entity].ent_type_
                temporal = ent_type in {'DATE', 'TIME'}
            else:
                temporal = False
            return entity, temporal
        else:
            entity, temps = zip(*[self._post_process(item) for item in entity])
            temporal = True in temps
            ct = connector_type(entity)
            # Multi-nooun concept, e.g.: (south america) -> (+ south america)
            if ct[0] == 'c':
                return connect('+/b/.', entity), temporal
            # Builders with one argument become modifiers
            # e.g. (on/b ice) -> (on/m ice)
            elif ct[0] == 'b' and is_atom(entity[0]) and len(entity) == 2:
                ps = atom_parts(entity[0])
                ps[1] = 'm' + ct[1:]
                return ('/'.join(ps),) + entity[1:], temporal
            # A meta-modifier applied to a concept defined my a modifier
            # should apply to the modifier instead.
            # e.g.: (stricking/w (red/m dress)) -> ((stricking/w red/m) dress)
            elif (ct[0] == 'w' and
                    is_atom(entity[0]) and
                    len(entity) == 2 and
                    is_edge(entity[1]) and
                    connector_type(entity[1])[0] == 'm'):
                return ((entity[0], entity[1][0]),) + entity[1][1:], temporal
            # Make sure that specifier arguments are of the specifier type,
            # entities are surrounded by an edge with a trigger connector if
            # necessary. E.g.: today -> {t/t/. today}
            elif ct[0] == 'p':
                pred = predicate(entity)
                if pred:
                    role = atom_role(pred)
                    if len(role) > 1:
                        arg_roles = role[1]
                        if 'x' in arg_roles:
                            proc_edge = list(entity)
                            trigger = 't/tt/.' if temporal else 't/t/.'
                            for i, arg_role in enumerate(arg_roles):
                                arg_pos = i + 1
                                if (arg_role == 'x' and
                                        is_atom(proc_edge[arg_pos])):
                                    proc_edge[arg_pos] = (trigger,
                                                          proc_edge[arg_pos])
                            return tuple(proc_edge), False
                return entity, temporal
            # Make triggers temporal, if appropriate.
            # e.g.: (in/t 1976) -> (in/tt 1976)
            elif ct[0] == 't':
                if temporal:
                    trigger = entity[0]  # TODO: make sure it's enough
                    triparts = atom_parts(trigger)
                    newparts = (triparts[0], 'tt')
                    if len(triparts) > 2:
                        newparts += tuple(triparts[2:])
                    trigger = '/'.join(newparts)
                    return (trigger,) + entity[1:], False
                else:
                    return entity, False
            else:
                return entity, temporal

    def _clean_parse_state(self):
        return self._ParseState(extra_edges=set(),
                                tokens={},
                                child_tokens=[],
                                positions={},
                                children=[],
                                entities=[])

    def _parse_token_children(self, token, ps):
        ps.child_tokens.extend(zip(token.lefts, repeat(True)))
        ps.child_tokens.extend(zip(token.rights, repeat(False)))

        for child_token, pos in ps.child_tokens:
            child, child_extra_edges = self._parse_token(child_token)
            if child:
                ps.extra_edges.update(child_extra_edges)
                ps.positions[child] = pos
                ps.tokens[child] = child_token
                child_type = entity_type(child)
                if child_type:
                    ps.children.append(child)
                    if child_type[0] in {'c', 'r', 'd', 's'}:
                        ps.entities.append(child)

        ps.children.reverse()

    def _build_atom(self, token, ent_type, pos, ps):
        text = token.text.lower()
        et = ent_type

        if ent_type[0] == 'p' and ent_type != 'pm':
            args = [arg_type(ps.tokens[entity]) for entity in ps.entities]
            args_string = ''.join([arg for arg in args if arg != '?'])

            # assign predicate subtype
            # (declarative, imperative, interrogative, ...)
            if len(ps.child_tokens) > 0:
                last_token = ps.child_tokens[-1][0]
            else:
                last_token = None
            if len(ent_type) == 1:
                # interrogative cases
                if (last_token and
                        last_token.tag_ == '.' and
                        last_token.dep_ == 'punct' and
                        last_token.lemma_.strip() == '?'):
                    ent_type = 'p?'
                # imperative cases
                elif (is_infinitive(token) and 's' not in args_string and
                        'TO' not in [child[0].tag_
                                     for child in ps.child_tokens]):
                    ent_type = 'p!'
                # declarative (by default)
                else:
                    ent_type = 'pd'

            et = '{}.{}'.format(ent_type, args_string)

        atom = build_atom(text, et, pos)
        self.atom2token[atom] = token
        return atom

    def _add_lemmas(self, token, entity, ent_type, ps):
        text = token.lemma_.lower()
        if text != token.text.lower():
            lemma = build_atom(text, ent_type[0], '{}.lemma'.format(self.lang))
            lemma_edge = ('lemma/p/.', entity, lemma)
            ps.extra_edges.add(lemma_edge)

    def _parse_token(self, token):
        # check what type token maps to, return None if if maps to nothing
        ent_type = token_type(token)
        if ent_type == '' or ent_type is None:
            return None, None

        # create clean parse state
        ps = self._clean_parse_state()

        # parse token children
        self._parse_token_children(token, ps)

        # build atom
        if self.pos:
            pos = '{}.{}'.format(self.lang, token.tag_.lower())
        else:
            pos = None
        atom = self._build_atom(token, ent_type, pos, ps)
        entity = atom

        # lemmas
        if self.lemmas:
            self._add_lemmas(token, entity, ent_type, ps)

        # process children
        relative_to_concept = []
        for child in ps.children:
            child_type = entity_type(child)

            logging.debug('entity: [%s] %s', ent_type, entity)
            logging.debug('child: [%s] %s', child_type, child)

            if child_type[0] in {'c', 'r', 'd', 's'}:
                if ent_type[0] == 'c':
                    if (connector_type(child) in {'pc', 'pr'} or
                            is_relative_concept(ps.tokens[child])):
                        logging.debug('choice: 1')
                        relative_to_concept.append(child)
                    elif connector_type(child)[0] == 'b':
                        if connector_type(entity)[0] == 'c':
                            logging.debug('choice: 2')
                            entity = nest(entity, child, ps.positions[child])
                        else:
                            logging.debug('choice: 3')
                            entity = apply_fun_to_atom(
                                lambda target:
                                    nest(target, child, ps.positions[child]),
                                    atom, entity)
                    elif connector_type(child)[0] in {'x', 't'}:
                        logging.debug('choice: 4')
                        entity = nest(entity, child, ps.positions[child])
                    else:
                        if ((entity_type(atom)[0] == 'c' and
                                connector_type(child)[0] == 'c') or
                                is_compound(ps.tokens[child])):
                            if connector_type(entity)[0] == 'c':
                                if connector_type(child)[0] == 'c':
                                    logging.debug('choice: 5a')
                                    entity = sequence(entity, child,
                                                      ps.positions[child])
                                else:
                                    logging.debug('choice: 5b')
                                    entity = sequence(entity, child,
                                                      ps.positions[child],
                                                      flat=False)
                            else:
                                logging.debug('choice: 6')
                                entity = apply_fun_to_atom(
                                    lambda target:
                                        sequence(target, child,
                                                 ps.positions[child]),
                                        atom, entity)
                        else:
                            logging.debug('choice: 7')
                            entity = apply_fun_to_atom(
                                lambda target:
                                    connect(target, (child,)),
                                    atom, entity)
                elif ent_type[0] in {'p', 'r', 'd', 's'}:
                    logging.debug('choice: 8')
                    entity = insert_after_predicate(entity, child)
                else:
                    logging.debug('choice: 9')
                    entity = insert_first_argument(entity, child)
            elif child_type[0] == 'b':
                if connector_type(entity) == 'c':
                    logging.debug('choice: 10')
                    entity = connect(child, entity)
                else:
                    logging.debug('choice: 11')
                    entity = nest(entity, child, ps.positions[child])
            elif child_type[0] == 'p':
                # TODO: Pathological case
                # e.g. "Some subspecies of mosquito might be 1s..."
                if child_type == 'pm':
                    logging.debug('choice: 12')
                    entity = (child,) + parens(entity)
                else:
                    logging.debug('choice: 13')
                    entity = connect(entity, (child,))
            elif child_type[0] == 'm':
                logging.debug('choice: 14')
                entity = (child, entity)
            elif child_type[0] in {'x', 't'}:
                logging.debug('choice: 15')
                entity = (child, entity)
            elif child_type[0] == 'a':
                logging.debug('choice: 16')
                entity = nest_predicate(entity, child, ps.positions[child])
            elif child_type == 'w':
                if ent_type[0] in {'d', 's'}:
                    logging.debug('choice: 17')
                    entity = nest_predicate(entity, child, ps.positions[child])
                    # pass
                else:
                    logging.debug('choice: 18')
                    entity = nest(entity, child, ps.positions[child])
            else:
                # TODO: warning ?
                logging.debug('choice: 19')
                pass

            ent_type = entity_type(entity)
            logging.debug('result: [%s] %s\n', ent_type, entity)

        if len(relative_to_concept) > 0:
            relative_to_concept.reverse()
            entity = (':/b/.', entity) + tuple(relative_to_concept)

        return entity, ps.extra_edges

    def parse_sentence(self, sent):
        self.atom2token = {}
        main_edge, extra_edges = self._parse_token(sent.root)
        main_edge, _ = self._post_process(main_edge)
        return {'main_edge': main_edge,
                'extra_edges': extra_edges,
                'text': str(sent),
                'spacy_sentence': sent}

    def parse(self, text):
        doc = self.nlp(text.strip())
        return tuple(self.parse_sentence(sent) for sent in doc.sents)
