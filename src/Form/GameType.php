<?php

namespace App\Form;

use App\Entity\Game;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;

class GameType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $this->requirecodex = $options['requirecodex'];

        $builder
            //->add('user')
            ->add('name', null, [
              'label' => 'Name'
            ])
            //->add('world')
            ->add('codex', TextareaType::class, [
                'label' => 'Codex',
                'help' => 'A short pitch of the game, that will be your first item',
                'required' => $this->requirecodex
            ])
            //->add('items')
            //->add('date')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Game::class,
            'requirecodex' => true,
        ]);
    }
}
