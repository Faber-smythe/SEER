<?php

namespace App\Form;

use App\Entity\World;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\FileType;

class WorldType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {

        $this->fileindication = $options['fileindication'];
        $builder
            // ->add('user')
            ->add('name', null, [
                'label' => 'NAME'
            ])
            ->add('imageFile', FileType::class, [
                'label' => 'ILLUSTRATION (optional)',
                'required' => false,
                'help' => $this->fileindication
            ])
            //->add('date')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => World::class,
            'fileindication' => null,
        ]);
    }
}
