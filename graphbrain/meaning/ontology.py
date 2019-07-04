import progressbar
from graphbrain import *
import graphbrain.constants as const


def subtypes(hg, ent):
    ont_edges = hg.pat2ents((const.type_of_pred, '*', ent))
    return tuple([edge[1] for edge in ont_edges])


def supertypes(hg, ent):
    ont_edges = hg.pat2ents((const.type_of_pred, ent, '*'))
    return tuple([edge[2] for edge in ont_edges])


def generate(hg, verbose=False):
    count = 0
    i = 0
    with progressbar.ProgressBar(max_value=hg.edge_count()) as bar:
        for edge in hg.all_edges():
            et = entity_type(edge)
            if et[0] == 'c':
                ct = connector_type(edge[0])
                parent = None
                if ct[0] == 'b':
                    mcs = main_concepts(edge)
                    if len(mcs) == 1:
                        parent = mcs[0]
                elif ct[0] == 'm' and len(edge) == 2:
                    parent = edge[1]
                if parent:
                    ont_edge = (const.type_of_pred, edge, parent)
                    # print(ent2str(ont_edge))
                    hg.add(ont_edge, primary=False)
                    count += 1
            i += 1
            bar.update(i)
    return count
